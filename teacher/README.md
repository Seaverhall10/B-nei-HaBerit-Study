# Facilitator guide

The facilitator guide is intentionally kept outside `public/`, so GitHub Pages does not deploy it with the participant site.

Build it after changing `public/weeks.json`:

```powershell
python tools/build_teacher_guide.py
```

This repository is public. Keeping the guide outside the deployed site prevents accidental participant discovery, but it is **not confidential access control**. A future private portal would require authentication and a private data store.
