"""
Instagram parser for @sunmax_lashes
Downloads profile photo and recent posts into images/ folder.

Usage:
    python instagram_parser.py

If Instagram asks for login, create a .env file with:
    IG_USERNAME=your_username
    IG_PASSWORD=your_password

Or pass --username and --password as arguments.
"""

import argparse
import os
import sys
import instaloader
from pathlib import Path

PROFILE = "sunmax_lashes"
OUTPUT_DIR = Path(__file__).parent / "images"

def main():
    parser = argparse.ArgumentParser(description="Download Instagram photos from @sunmax_lashes")
    parser.add_argument("--username", help="Instagram username (optional)")
    parser.add_argument("--password", help="Instagram password (optional)")
    parser.add_argument("--count", type=int, default=12, help="Max posts to download (default: 12)")
    parser.add_argument("--login-only", action="store_true", help="Only try to login, don't download")
    args = parser.parse_args()

    loader = instaloader.Instaloader(
        download_videos=False,
        download_video_thumbnails=False,
        download_geotags=False,
        download_comments=False,
        save_metadata=False,
        compress_json=False,
        max_connection_attempts=3,
    )

    # Login if credentials provided
    if args.username and args.password:
        try:
            loader.login(args.username, args.password)
            print("Logged in successfully")
        except Exception as e:
            print(f"Login failed: {e}")
            print("Continuing without login...")
    elif args.login_only:
        print("No credentials provided for --login-only")
        return

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Downloading from @{PROFILE} to {OUTPUT_DIR}")
    print(f"Max posts: {args.count}")

    try:
        profile = instaloader.Profile.from_username(loader.context, PROFILE)
        print(f"Profile: {profile.full_name} ({profile.mediacount} posts)")

        count = 0
        for post in profile.get_posts():
            if count >= args.count:
                break

            # Download only if it has at least one image
            if post.typename == "GraphImage" or (post.typename == "GraphSidecar" and post.mediacount > 0):
                loader.download_post(post, target=str(OUTPUT_DIR / f"post_{count+1}"))
                count += 1
                print(f"  [{count}/{args.count}] Downloaded post {post.shortcode}")

        print(f"\nDone! Downloaded {count} posts to: {OUTPUT_DIR}")
        print("\nFiles saved to: D:\\проекты\\OpenCode\\сайты\\sunmax\\images\\")

    except instaloader.exceptions.ProfileNotExistsException:
        print(f"Error: Profile @{PROFILE} not found")
        sys.exit(1)
    except instaloader.exceptions.ConnectionException as e:
        print(f"Connection error: {e}")
        print("\nInstagram may be blocking requests. Try:")
        print("  1. python instagram_parser.py --username YOUR_LOGIN --password YOUR_PASS")
        print("  2. Or manually download photos and save to images/ folder")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
