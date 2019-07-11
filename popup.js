let taRank = 0;
let txt = "";
let url = ""

let cityName = ["뉴욕","오사카","파리","런던","방콕","도쿄","홍콩","싱가포르","타이베이","마카오","다낭","상하이","로마","바르셀로나","하노이", "시드니"];
let cityName_en = ["york","osaka","paris","london","bangkok","tokyo","hong","singa","taipei","macau","nang","shang","rome","barcelona","hanoi","sydney"];
let cityCode = ["nyc","osk","par","ldn","bkk","tyo","hkg","sin","tpe","mfm","dad","sha","rom","bcn","han","syd"];

let city = ""
let cityNameKo = ""


chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {
    txt = request.source

    chrome.tabs.query({
        active:true,
        currentWindow:true
    },function(tabs){
        url = tabs[0].url;

        detectSite(url);
    })
  }
});

$(".start").click(function(){
    if($(".site").attr("id")==="unknown"){
        alert("여행정보 사이트가 감지되지 않습니다.")
    }else{

        switch ($(".site").attr("id")) {
            case "visa": parse_visa.init();
                break;

            case "master": parse_master.init();
                break;

            case "gg": parse_gg.init(txt, url);
                break;

            case "lp": parse_lp.init(txt, url);
                break;

            case "nv": parse_nv.init(txt, url);
                break;

            case "ta": parse_ta.init(txt, url);
                break;

            case "hw": parse_hw.init(txt, url);
                break;

            default: return false;

        }
    }
})

function onWindowLoad() {

    var config = {
        apiKey: "AIzaSyBKgdEC20ODa-miFUXStyYmAdyoY4FzOc0",
        authDomain: "intranet-efcad.firebaseapp.com",
        databaseURL: "https://intranet-efcad.firebaseio.com",
        projectId: "intranet-efcad",
        storageBucket: "",
        messagingSenderId: "141304382157"
    };
    firebase.initializeApp(config);

    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
          console.log(user)
        firebase.database().ref().once("value", snap => {
            chrome.tabs.executeScript(null, {
              file: "getPagesSource.js"
            })
        })

      } else {
        // No user is signed in.
        firebase.auth().signInWithPopup(provider).then(function(result) {
            firebase.database().ref().once("value", snap => {
                chrome.tabs.executeScript(null, {
                  file: "getPagesSource.js"
                })
            })
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
          console.log(error.message)
        });
      }
    });


}

window.onload = onWindowLoad;


function detectSite(url){
    if(url.indexOf("visa.com")>-1){
        $(".site").html("비자카드가 감지되었습니다.")
        $(".site").attr("id","visa");
    }else if(url.indexOf("mastercard")>-1){
        $(".site").html("마스터카드가 감지되었습니다.")
        $(".site").attr("id","master");
    }else if(url.indexOf("naver")>-1){
        $(".site").html("네이버가 감지되었습니다.")
        $(".site").attr("id","nv");
    }else if(url.indexOf("tripadvisor")>-1){
        $(".site").html("트립어드바이저가 감지되었습니다.")
        $(".site").attr("id","ta");
    }else if(url.indexOf("lonelyplanet")>-1){
        $(".site").html("론리플래닛이 감지되었습니다.")
        $(".site").attr("id","lp");
    }else if(url.indexOf("google")>-1){
        $(".site").html("구글이 감지되었습니다.")
        $(".site").attr("id","gg");
    }else if(url.indexOf("hostelworld")>-1){
        $(".site").html("호스텔월드가 감지되었습니다.")
        $(".site").attr("id","hw");
    }else{
        $(".site").html("여행정보 사이트가 감지되지 않습니다.")
    }
}
