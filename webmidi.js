var colorH=[0, 0, 0];
var radioButtonId=["noEffect", "candleEffect", "flashing", "pulse", "rainbow", "rainbowFade"];
var nowIdx=0;
var factor={x:1.8, y:4};//290/127; // radius of color picker:290 
var posX=300, posY=300;
var center={x:300, y:300};
var pi=Math.PI;
window.addEventListener("midiin-event:input-port", function(event) {
    var msg=event.detail.data;
    //if(msg[0]==0xf8) return;
    var ch=msg[0] & 0x0f;
    switch(msg[0] & 0xf0) {
      case 0x80:
        break;
      case 0x90:
        console.log("noteOn", msg[0].toString(16), msg[1].toString(16), msg[2].toString(16));
        var angle=(msg[1]-48) * 2*pi/25;
        var radius=1.4*msg[2];
        if(radius<40) {
            radius=40;
        }
        radius=190*radius/127;
        posX=parseInt(center.x+radius*Math.sin(angle));
        posY=parseInt(center.y+radius*Math.cos(angle));
        drawPos(posX, posY);
        break;
      case 0xb0:
        if(msg[1]==20){
            var idx=parseInt(msg[2]/22);
            if(nowIdx!=idx) {
                var event= document.createEvent("MouseEvents");
                var element=document.querySelector("#"+radioButtonId[idx]);
                event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, element);
                element.dispatchEvent(event);  
                changeColorMidi();
                nowIdx=idx;
            }
        } else if(msg[1]==18 || msg[1]==19){
            var val=parseInt(parseInt(msg[2],16));
            switch(msg[1]) {
              case 18:
                posX=factor.x*val;
                if(posX<10) posY=10;
                if(posX>590) posY=590;
                break;
              case 19:
                posY=factor.y*val;
                if(posY<10) posY=10;
                if(posY>590) posY=590;
                break;
            }
/*
            var a=Math.sqrt(Math.pow(posX-center.x, 2)+Math.pow(posY-center.y, 2));
            if(a>290) {
                var ty=290*(posY-center.y)/(posX-center.x)+center.y;
                var tx=Math.sqrt(Math.pow(290, 2)-Math.pow(ty-center.y, 2))+center.x;
                //posY=parseInt(ty);
                //posX=parseInt(tx);
                console.log("[outside]", posX, posY);
            }
*/
            if((posX>10 && posX<590) && (posY>10 && posY<590)) {
                drawPos(parseInt(posX), parseInt(posY));
            } else {
                changeColor();
            }
        } else if(msg[1]==24 || msg[1]==25 || msg[1]==26) {
            if(msg[1]==24) r=2*msg[2];
            if(msg[1]==25) g=2*msg[2];
            if(msg[1]==26) b=2*msg[2];
            //changeColor();
            //drawMidi();
            changeColor();
        }
        
        break;
    }
    
});

function changeColorMidi() {
/*
    r=colorH[0];
    g=colorH[1];
    b=colorH[2];
*/
    //console.log(r, g, b);
    changeColor();
    //drawMidi();
}

function drawPos(x, y) {
    console.log("[Position] ", x, y);

    var canvas = document.querySelector('canvas');
    var context = canvas.getContext('2d');

    canvas.width = 300 * devicePixelRatio;
    canvas.height = 300 * devicePixelRatio;
    canvas.style.width = "300px";
    canvas.style.height = "300px";
    draw(x, y);
    
    function draw(x, y) {
        // Refresh canvas in case user zooms and devicePixelRatio changes.
        canvas.width = 300 * devicePixelRatio;
        canvas.height = 300 * devicePixelRatio;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        var data = context.getImageData(0, 0, canvas.width, canvas.height).data;

        r = data[((canvas.width * y) + x) * 4];
        g = data[((canvas.width * y) + x) * 4 + 1];
        b = data[((canvas.width * y) + x) * 4 + 2];
        
        changeColor();

        context.beginPath();
        context.arc(x, y + 2, 10 * devicePixelRatio, 0, 2 * Math.PI, false);
        context.shadowColor = '#333';
        context.shadowBlur = 4 * devicePixelRatio;
        context.fillStyle = 'white';
            context.fill();
    }

};

function drawMidi() {
    var canvas = document.querySelector('canvas');
    var context = canvas.getContext('2d');
    // Refresh canvas in case user zooms and devicePixelRatio changes.
    var data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    var found=false, num=0;
    for(var i=0; i<data.length-2; i=i+3) {
        if(rd(data[i])==rd(r) && rd(data[i+1])==rd(g) && rd(data[i+2])==rd(b)) {
            //console.log("[[[[match]]]]", rd(data[i])+" : "+rd(r)+" :: "+rd(data[i+1])+" : "+rd(g)+" :: "+rd(data[i+2])+" : "+rd(b));
            found=true;
            num=i;
            break;
        } 
    }
    if(found==true) {
        var row=parseInt(num/300);
        var col=num%300;
        drawPos(row, col);
    } 
    function rd(val) {
        return parseInt(0.1*val)*10;
    }
};
