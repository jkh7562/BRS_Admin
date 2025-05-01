import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import root from "./router/root";

function App() {
  useEffect(() => {
    const kakaoScript = document.createElement("script");
    kakaoScript.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_JS_KEY}&autoload=false&libraries=services`;
    kakaoScript.async = true;

    kakaoScript.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          console.log("✅ Kakao Maps SDK 로드 완료");
        });
      }
    };

    document.head.appendChild(kakaoScript);

    return () => {
      document.head.removeChild(kakaoScript);
    };
  }, []);

  return <RouterProvider router={root} />;
}

export default App;
