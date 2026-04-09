# App Store Submission Checklist

This repository now avoids the main repo-side review risks for the current app:

- Production builds no longer ship seeded demo data.
- Internal debug storage tools are hidden from release builds.
- The app includes an in-app Privacy & Data screen.
- Local data reset works without requiring the user to restart the app.

Manual items still required before submitting to App Review:

- Add a real privacy policy URL in App Store Connect metadata.
- Add real support contact information and a Support URL.
- Set your final iOS bundle identifier, signing, and build metadata before creating the App Store build.
- Capture screenshots from the production build, not from development mode.
- Answer the age rating questionnaire accurately. Based on the current source audit, `4+` is the likely result, but confirm in App Store Connect.
- Test the release build on a physical iPhone and iPad through TestFlight for layout, persistence, and navigation.
- If you add analytics, accounts, cloud sync, notifications, ads, or purchases later, update the privacy policy, App Privacy answers, and review notes before submission.

Recommended App Review notes for this version:

- No login required.
- No in-app purchases or subscriptions.
- No user-generated content.
- User data is stored locally on-device for offline habit tracking.
