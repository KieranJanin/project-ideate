// src/static/js/landing_auth.js

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const signInButton = document.getElementById('google-signin-button');
const signOutButton = document.getElementById('sign-out-button');
const userInfoDiv = document.getElementById('user-info');
const userDisplayNameSpan = document.getElementById('user-display-name');
const workflowCards = document.getElementById('workflow-cards');

// State change listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in.
        userInfoDiv.classList.remove('hidden');
        signInButton.classList.add('hidden');
        userDisplayNameSpan.textContent = user.displayName || user.email;
        // Potentially enable workflow cards here
        workflowCards.style.pointerEvents = 'auto'; // Enable clicks
        workflowCards.style.opacity = '1';

        // Store ID token in session storage for backend requests
        user.getIdToken().then(idToken => {
            sessionStorage.setItem('idToken', idToken);
        });

    } else {
        // User is signed out.
        userInfoDiv.classList.add('hidden');
        signInButton.classList.remove('hidden');
        userDisplayNameSpan.textContent = '';
        // Disable workflow cards until signed in
        workflowCards.style.pointerEvents = 'none'; // Disable clicks
        workflowCards.style.opacity = '0.5';
        sessionStorage.removeItem('idToken');
    }
});

// Sign-in event
if (signInButton) {
    signInButton.addEventListener('click', () => {
        auth.signInWithPopup(provider)
            .then((result) => {
                // Google Sign-In successful.
                console.log("User signed in:", result.user);
                // The onAuthStateChanged listener will handle UI updates and token storage
            })
            .catch((error) => {
                console.error("Google Sign-In Error:", error);
                alert(`Sign-in failed: ${error.message}`);
            });
    });
}

// Sign-out event
if (signOutButton) {
    signOutButton.addEventListener('click', () => {
        auth.signOut()
            .then(() => {
                console.log("User signed out.");
                // The onAuthStateChanged listener will handle UI updates
                // Redirect to landing page after sign out if not already there
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            })
            .catch((error) => {
                console.error("Sign Out Error:", error);
                alert(`Sign-out failed: ${error.message}`);
            });
    });
}

// Initial state check for workflow cards
// This runs once on page load to set the initial state of the workflow cards.
if (auth.currentUser) {
    workflowCards.style.pointerEvents = 'auto';
    workflowCards.style.opacity = '1';
} else {
    workflowCards.style.pointerEvents = 'none';
    workflowCards.style.opacity = '0.5';
}
