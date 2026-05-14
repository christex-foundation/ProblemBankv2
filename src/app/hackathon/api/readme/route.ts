import { NextRequest, NextResponse } from 'next/server';

interface GitHubReadmeResponse {
  name: string;
  content: string;
  download_url: string;
}

interface GitHubRepoResponse {
  name: string;
  description: string | null;
  html_url: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repoUrl = searchParams.get('url');

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }

    // Extract owner and repo from GitHub URL
    const githubMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!githubMatch) {
      return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 });
    }

    const [, owner, repo] = githubMatch;
    const repoName = repo.replace(/\.git$/, ''); // Remove .git suffix if present

    // Fetch repository info and README in parallel
    const [repoResponse, readmeResponse] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ProblemBank-DevStack'
        }
      }),
      fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'ProblemBank-DevStack'
        }
      })
    ]);

    if (!repoResponse.ok) {
      return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
    }

    const repoData: GitHubRepoResponse = await repoResponse.json();
    
    let readmeContent = '';
    let readmeUrl = '';

    if (readmeResponse.ok) {
      const readmeData: GitHubReadmeResponse = await readmeResponse.json();
      readmeContent = readmeData.content;
      readmeUrl = readmeData.download_url;
    }

    // Parse README content
    let summary = '';
    if (readmeContent) {
      // Decode base64 content
      const decodedContent = Buffer.from(readmeContent, 'base64').toString('utf-8');
      
      // Extract meaningful content (first paragraph after title)
      const lines = decodedContent.split('\n').filter(line => line.trim());
      
      // Skip title (usually first line with #)
      let startIndex = 0;
      if (lines[0] && lines[0].startsWith('#')) {
        startIndex = 1;
      }
      
      // Find first meaningful paragraph
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#') && !line.startsWith('[') && !line.startsWith('![')) {
          // Remove markdown formatting
          const cleanLine = line
            .replace(/#{1,6}\s*/g, '') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
            .replace(/`([^`]+)`/g, '$1') // Remove code formatting
            .replace(/^\s*[-*+]\s*/, '') // Remove list markers
            .trim();
          
          if (cleanLine.length > 10) { // Only meaningful content
            summary = cleanLine;
            break;
          }
        }
      }
    }

    // Fallback to repository description if no README content
    if (!summary && repoData.description) {
      summary = repoData.description;
    }

    // Fallback to generic message
    if (!summary) {
      summary = 'A development repository with implementation resources and documentation.';
    }

    // Truncate to fit 4 lines (~200-250 characters)
    if (summary.length > 200) {
      summary = summary.substring(0, 200).trim();
      // Try to end at a word boundary
      const lastSpace = summary.lastIndexOf(' ');
      if (lastSpace > 150) {
        summary = summary.substring(0, lastSpace);
      }
      summary += '...';
    }

    return NextResponse.json({
      name: repoData.name,
      description: summary,
      url: repoData.html_url,
      readmeUrl
    });

  } catch (error) {
    console.error('Error fetching repository info:', error);
    return NextResponse.json({ error: 'Failed to fetch repository information' }, { status: 500 });
  }
}










