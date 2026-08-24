# B’nei Haberit Study

A phone-first, Scripture-first companion for a twelve-week study of Yahweh’s covenant family and the biblical story.

## Participant experience

The public site is built from `public/` and deployed to GitHub Pages after validation passes on `main`. Participants can:

- read each week’s focused passages directly in the public-domain World English Bible;
- compare the same references in NIV or NASB at BibleGateway;
- move through all twelve weeks and the interactive story map;
- distinguish direct text, connections, and study conclusions;
- save reading checks and preparation notes locally without an account; and
- install the site or reopen it offline after a successful first visit.

Reading checks and notes never leave the participant’s browser. Clearing browser storage removes them.

## Editing the study

`public/weeks.json` is the single source for the twelve participant weeks and the facilitator guide. After editing it:

```powershell
python tools/build_focus_scripture.py --web-dir <path-to-WEB-json-folder>
python tools/build_teacher_guide.py
python tools/validate_site.py
```

The embedded Scripture is World English Bible (WEB), Public Domain, sourced from [eBible.org](https://ebible.org/find/show.php?id=eng-web). NIV and NASB text is not copied into this repository.

## Facilitator boundary

The generated facilitator guide is `teacher/guide.html`, outside `public/`, so GitHub Pages does not deploy it. Because this GitHub repository is public, that file is not confidential. True private access would require a private service with authentication.

## Deployment

Pull requests run validation only. A merge or push to `main` deploys `public/` through GitHub Actions. Do not publish the repository root or manually bypass the workflow.
