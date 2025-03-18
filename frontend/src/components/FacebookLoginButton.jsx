import { useEffect, useState } from "react";

const FacebookLoginButton = ({ onLoginSuccess }) => {
  const [fbLoaded, setFbLoaded] = useState(false);

  useEffect(() => {
    // Kiểm tra xem FB SDK đã tải xong chưa
    const checkFbLoaded = setInterval(() => {
      if (window.FB) {
        setFbLoaded(true);
        clearInterval(checkFbLoaded);
      }
    }, 100);

    return () => clearInterval(checkFbLoaded);
  }, []);

  const handleLogin = () => {
    if (!fbLoaded) {
      console.error("Facebook SDK not loaded yet");
      return;
    }

    window.FB.login(
      function (response) {
        if (response.authResponse) {
          console.log("User logged in: ", response);
          onLoginSuccess(response.authResponse.accessToken);
        } else {
          console.log("User cancelled login or did not fully authorize.");
        }
      },
      { scope: "public_profile,email" }
    );
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-blue-600 text-white p-2 rounded-md"
      disabled={!fbLoaded}
    >
      Login with Facebook
    </button>
  );
};

export default FacebookLoginButton;