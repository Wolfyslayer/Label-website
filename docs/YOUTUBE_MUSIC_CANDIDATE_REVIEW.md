# YouTube Music candidate review

This workflow addresses the missing links reported for Frostmark and Wolfyslayer without making speculative changes to the public site.

Go to **Actions → YouTube Music Candidate Review → Run workflow**. Select **frostmark** first and a limit of **5**. When the run completes, download the `youtube-music-candidates-frostmark` artifact.

The report searches YouTube videos (including potentially distributed Topic uploads) and displays candidate title, channel, length, and strict title/duration comparisons. **All candidates are unverified.** YouTube Data API does not expose a complete YouTube Music recording catalog or establish rights/ownership from a matching title. Check the actual recording in YouTube Music before saving its URL with the existing **YouTube Music Link Manager** `set-track` action.

Each track search costs approximately 100 YouTube Data API quota units; this manual workflow caps runs at 10 searches, uses no scheduled searches, and never writes catalog JSON. It does not auto-approve or auto-link suggestions. The same artist's first unlinked tracks will appear again until links are approved; future pagination can be added after evaluating report quality.
