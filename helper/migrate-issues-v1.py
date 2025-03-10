import subprocess
import json
import time
import requests
from dotenv import load_dotenv
import os
from datetime import datetime

SOURCE_REPO = "pirsani/panda"
TARGET_REPO = "pirsani/strasa"

# Load environment variables from .env file
load_dotenv()

# Define the cutoff date (only migrate comments older than this date)
CUTOFF_DATE = datetime(2025, 3, 7)  # Example: March, 2025

def run_gh_command(command):
    """Run GitHub CLI command and return parsed JSON output or None on failure."""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=30, encoding='utf-8')
        if result.returncode != 0:
            print(f"⚠️ Error running command: {command}\n{result.stderr}")
            return None
        return json.loads(result.stdout) if result.stdout else []
    except subprocess.TimeoutExpired:
        print(f"⏳ Command timed out: {command}")
        return None
    except json.JSONDecodeError:
        print(f"❌ Failed to decode JSON from command: {command}")
        return None

def fetch_all_issues(repo):
    """Fetch all issues (open & closed) from the repository using pagination."""
    issues = []
    page = 1
    per_page = 100  # Number of issues per page (max 100)

    while True:
        # Fetch issues for the current page
        command = f'gh issue list --repo {repo} --state all --json number --limit {per_page} '
        result = run_gh_command(command)

        if not result:
            break  # Stop if no more issues are returned

        issues.extend(result)
        if len(result) < per_page:
            break  # Stop if fewer issues are returned than the per_page limit

        page += 1  # Move to the next page

    return issues

def get_gh_token():
    """Retrieve the GitHub token from the .env file."""
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        print("❌ GitHub token not found in .env file. Please add GITHUB_TOKEN to your .env file.")
        exit(1)
    return token

def create_issue(repo, title, body, labels, state):
    """Create an issue in the target repository and return the new issue number."""
    url = f"https://api.github.com/repos/{repo}/issues"
    headers = {
        "Authorization": f"token {get_gh_token()}",
        "Accept": "application/vnd.github.v3+json"
    }
    data = {
        "title": title,
        "body": body,
        "labels": labels,
        "state": state
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code == 201:
        new_issue_number = response.json()["number"]
        print(f"✅ Created issue #{new_issue_number} in {repo}")
        return new_issue_number
    else:
        print(f"❌ Failed to create issue in {repo}: {response.text}")
        return None

def is_comment_older_than_cutoff(comment):
    """Check if a comment is older than the cutoff date."""
    created_at = comment.get("createdAt")
    if not created_at:
        return False  # Skip if the creation date is missing

    # Parse the creation date
    comment_date = datetime.strptime(created_at, "%Y-%m-%dT%H:%M:%SZ")
    return comment_date < CUTOFF_DATE

# ✅ Check GitHub authentication before running
auth_check = subprocess.run("gh auth status", shell=True, capture_output=True, text=True, encoding='utf-8')
if auth_check.returncode != 0:
    print("❌ GitHub CLI authentication failed! Run `gh auth login` and try again.")
    exit(1)

try:
    # Fetch all issues (open & closed) with pagination
    issues = fetch_all_issues(SOURCE_REPO)

    if not issues:
        raise Exception("Failed to fetch issues from source repository")

    # Sort issues by number in ascending order (from #1 to #N)
    issues_sorted = sorted(issues, key=lambda x: x['number'])

    for issue in issues_sorted:
        issue_number = issue['number']
        print(f"🚀 Migrating issue #{issue_number}...")

        # Get issue details
        issue_data = run_gh_command(f'gh issue view {issue_number} --repo {SOURCE_REPO} --json title,body,labels,state,comments')

        if issue_data is None:
            print(f"⚠️ Skipping issue #{issue_number} (Failed to fetch details)")
            continue

        title = issue_data.get("title", "No Title")
        body = issue_data.get("body", "")
        labels = [label["name"] for label in issue_data.get("labels", [])]
        state = issue_data.get("state", "open")
        comments = issue_data.get("comments", [])

        # Create issue in the target repo
        new_issue_number = create_issue(TARGET_REPO, title, body, labels, state)
        if not new_issue_number:
            continue

        # 📝 Add a comment on the original issue linking to the migrated issue
        subprocess.run(
            f'gh issue comment {issue_number} --repo {SOURCE_REPO} --body "This issue has been migrated to {TARGET_REPO} as issue #{new_issue_number}"',
            shell=True, encoding='utf-8'
        )
        print(f"📝 Commented on original issue #{issue_number} in {SOURCE_REPO} to link to #{new_issue_number}")

        # Copy comments (only if older than the cutoff date)
        for comment in comments:
            if is_comment_older_than_cutoff(comment):
                comment_body = comment["body"]
                subprocess.run(f'gh issue comment {new_issue_number} --repo {TARGET_REPO} --body "{comment_body}"', shell=True, encoding='utf-8')
                print(f"📝 Copied comment from issue #{issue_number} to #{new_issue_number}")
            else:
                print(f"⏩ Skipping comment from issue #{issue_number} (created after cutoff date)")

        # If the original issue was closed, close the new one too
        # if state == "closed":
        #     subprocess.run(f'gh issue close {new_issue_number} --repo {TARGET_REPO} --reason "completed"', shell=True, encoding='utf-8')
        #     print(f"🔒 Closed issue #{new_issue_number} in {TARGET_REPO}")

        # ✅ Close the original issue in the source repo
        subprocess.run(f'gh issue close {issue_number} --repo {SOURCE_REPO} --reason "not planned"', shell=True, encoding='utf-8')
        print(f"✅ Closed original issue #{issue_number} in {SOURCE_REPO}")

    print("🎉 Migration completed!")

except Exception as e:
    print(f"❌ An error occurred: {str(e)}")