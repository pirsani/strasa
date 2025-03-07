import subprocess
import json

source_repo = "pirsani/panda"
target_repo = "pirsani/strasa"

try:
    # Get the list of issues
    issues = subprocess.check_output(
        ["gh", "issue", "list", "--repo", source_repo, "--json", "number", "--jq", ".[].number"]
    ).decode("utf-8").splitlines()

    for issue in issues:
        # Get issue details
        title = subprocess.check_output(
            ["gh", "issue", "view", issue, "--repo", source_repo, "--json", "title", "--jq", ".title"]
        ).decode("utf-8").strip()
        body = subprocess.check_output(
            ["gh", "issue", "view", issue, "--repo", source_repo, "--json", "body", "--jq", ".body"]
        ).decode("utf-8").strip()
        labels = subprocess.check_output(
            ["gh", "issue", "view", issue, "--repo", source_repo, "--json", "labels", "--jq", '[.labels[].name] | join(",")']
        ).decode("utf-8").strip()

        # Create issue in target repo
        create_issue_cmd = ["gh", "issue", "create", "--repo", target_repo, "--title", title, "--body", body]
        if labels:
            create_issue_cmd.extend(["--label", labels])
        subprocess.run(create_issue_cmd)

        # Get comments
        comments = subprocess.check_output(
            ["gh", "issue", "view", issue, "--repo", source_repo, "--json", "comments", "--jq", ".comments[].body"]
        ).decode("utf-8").splitlines()

        # Add comments to the new issue
        for comment in comments:
            subprocess.run(["gh", "issue", "comment", issue, "--repo", target_repo, "--body", comment])

except subprocess.CalledProcessError as e:
    print(f"Error: {e.output.decode('utf-8')}")
    print(f"Command: {e.cmd}")
    print(f"Return code: {e.returncode}")