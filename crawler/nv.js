let parse_nv = {
    init: function(txt, url){
        let decodedUrl = decodeURI(url)
        //검색어 쿼리를 알아내기 위해 url을 디코드한다.

        let isDefined = false;

        for (var i = 0; i < cityName.length; i++) {
            if(decodedUrl.includes(cityName[i])){
                city = cityCode[i];
                isDefined = true;
                let textToParse = txt.slice(txt.indexOf("top_card _container"),txt.indexOf("sct_pgnv"))

                this.surface(textToParse);
            }
        }

        if(!isDefined){
            $(".site").html("인식할 수 없는 도시명입니다. 확인해주세요!")
        }
    },

    surface: function(text){
        let that = this;

        let spotUrlIdx = text.indexOf('?where=nexearch');

        let spotUrl = text.slice(spotUrlIdx)
        spotUrl = 'https://search.naver.com/search.naver'+ spotUrl.slice(0,spotUrl.indexOf('">'))
        spotUrl = spotUrl.replace(/&amp/g,'')
        spotUrl = spotUrl.replace(/;/g,'&')

        let rank = text.slice(text.indexOf('<span class="grade">')+20);
        rank = rank.slice(0,rank.indexOf("위"))

        if(spotUrlIdx > 0){
            let afterTxt = text.slice(text.indexOf('<div class="list_title">'))
            afterTxt = afterTxt.slice(afterTxt.indexOf('<strong>')+8)

            let nameEndIdx = afterTxt.indexOf('</strong>')
            let name = afterTxt.slice(0,nameEndIdx)

            let tag = afterTxt.slice(afterTxt.indexOf('cate">')+6);
            tag = tag.slice(0,tag.indexOf('</span>'))

            this.spot(spotUrl, name, tag, rank)

            setTimeout(function () {
                that.surface(afterTxt)
            }, 1000);
        }else{
            $(".site").html("처리 완료")
        }
    },

    spot: function(url, name, tag, rank){

        let request = new XMLHttpRequest();
        request.open("GET",url,false);
        //url에 get 요청을 보낼 것이며, 비동기 방식으로 실행될것이다(3번째 파라미터 async : true)
        request.onreadystatechange = function(){
            if(request.readyState === 4 && request.status === 200){
                //제대로 통신 되었는지를 확인한다.
                let type = request.getResponseHeader("Content-Type");
                //잘 통신이 되었다면 받아온 데이터의 타입을 확인한다.
                   if (type.match(/^text/)){
                       let txt = (request.responseText);
                       //데이터 타입이 텍스트가 맞다면 받아온 데이터를 txt라는 변수에 넣는다.

                       let coorTxt = txt.slice(txt.indexOf('www.google.co.kr'));
                       coorTxt = coorTxt.slice(coorTxt.indexOf('@')+1)
                       coorTxt = coorTxt.slice(0,coorTxt.indexOf(',14z'))

                       let coor = coorTxt.split(",")

                       if(coor.length === 2){
                           if(!isNaN(coor[0])&&!isNaN(coor[1])){
                               coor={lat:coor[0],lng:coor[1]}
                           }else{
                               coor={}
                           }

                       }else{
                           coor={}
                       }

                       let homeUrl = txt.slice(txt.indexOf('home_url'))
                       homeUrl = homeUrl.slice(homeUrl.indexOf('blank">')+7)
                       homeUrl = homeUrl.slice(0, homeUrl.indexOf('</a>'))
                       let placeRank = rank*1 - 1

                       $(".site").html("처리중 - "+name)

                       firebase.database().ref("cities/"+city+"/spots/nv/"+placeRank).set({
                           name:name,
                           tag:[tag],
                           rank:rank*1-1,
                           coor:coor,
                           url:homeUrl.trim()
                       })

                 }else{
                     console.log('응답이 텍스트가 아닌 형태로 왔습니다')
                     //데이터 타입이 텍스트가 아니라면 문제가 발생한 것이다.
                 }
             }else{
                 console.log('사이트 응답 지연중')
                 //비동기 방식의 특성상, 이 로그는 서버 응답이 아무리 빨라도 몇 차례 뜰 것이다.
             }
         };
         request.send(null)
    }
}
