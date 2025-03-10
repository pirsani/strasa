import subprocess
import json
import time

SOURCE_REPO = "pirsani/panda"
TARGET_REPO = "pirsani/strasa"


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

# ✅ Check GitHub authentication before running
auth_check = subprocess.run("gh auth status", shell=True, capture_output=True, text=True, encoding='utf-8')
if auth_check.returncode != 0:
    print("❌ GitHub CLI authentication failed! Run `gh auth login` and try again.")
    exit(1)

try:
    # Fetch all issues (open & closed)
    issues = run_gh_command(f'gh issue list --repo {SOURCE_REPO} --state all --json number')

    if issues is None:
        raise Exception("Failed to fetch issues from source repository")

    for issue in issues:
        issue_number = issue['number']
        print(f"🚀 Migrating issue #{issue_number}...")

        # Get issue details
        issue_data = run_gh_command(f'gh issue view {issue_number} --repo {SOURCE_REPO} --json title,body,labels,state,comments')

        if issue_data is None:
            print(f"⚠️ Skipping issue #{issue_number} (Failed to fetch details)")
            continue

        title = issue_data.get("title", "No Title")
        body = issue_data.get("body", "")
        labels = ",".join([label["name"] for label in issue_data.get("labels", [])])
        state = issue_data.get("state", "open")
        comments = issue_data.get("comments", [])

        # Create issue in the target repo
        create_command = f'gh issue create --repo {TARGET_REPO} --title "{title}" --body "{body}"'
        if labels:
            create_command += f' --label "{labels}"'

        create_result = subprocess.run(create_command, shell=True, capture_output=True, text=True, encoding='utf-8')
        if create_result.returncode != 0:
            print(f"❌ Failed to create issue in target repository: {create_result.stderr}")
            continue

        # ✅ Fetch newly created issue number correctly
        time.sleep(2)  # Wait to avoid rate limiting
        new_issues = run_gh_command(f'gh issue list --repo {TARGET_REPO} --json number --limit 1')
        if not new_issues or not isinstance(new_issues, list) or len(new_issues) == 0:
            print(f"⚠️ Could not find newly created issue for #{issue_number}")
            continue

        new_issue_number = new_issues[0].get("number")
        print(f"✅ Created issue #{new_issue_number} in {TARGET_REPO}")

        # 📝 Add a comment on the original issue linking to the migrated issue
        subprocess.run(
            f'gh issue comment {issue_number} --repo {SOURCE_REPO} --body "This issue has been migrated to {TARGET_REPO} as issue #{new_issue_number}"',
            shell=True, encoding='utf-8'
        )
        print(f"📝 Commented on original issue #{issue_number} in {SOURCE_REPO} to link to #{new_issue_number}")

        # Copy comments
        for comment in comments:
            comment_body = comment["body"]
            subprocess.run(f'gh issue comment {new_issue_number} --repo {TARGET_REPO} --body "{comment_body}"', shell=True, encoding='utf-8')

        # If the original issue was closed, close the new one too
        if state == "closed":
            subprocess.run(f'gh issue close {new_issue_number} --repo {TARGET_REPO} --reason "completed"', shell=True, encoding='utf-8')
            print(f"🔒 Closed issue #{new_issue_number} in {TARGET_REPO}")

        # ✅ Close the original issue in the source repo
        subprocess.run(f'gh issue close {issue_number} --repo {SOURCE_REPO} --reason "not planned"', shell=True, encoding='utf-8')
        print(f"✅ Closed original issue #{issue_number} in {SOURCE_REPO}")

    print("🎉 Migration completed!")

except Exception as e:
    print(f"❌ An error occurred: {str(e)}")