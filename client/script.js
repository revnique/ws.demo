//Websocket variables
const wsPort = 11011;
const url = `ws://localhost:${wsPort}/myWebsocket`;
const mywsServer = new WebSocket(url);

//DOM Elements
const mainTagImage = document.getElementById("mainTagImage");
const peerCursor = document.getElementById("peerCursorBox");
const remoteUserNameText = document.getElementById("remoteUserNameText");
const mainTagImageContainer = document.getElementById("mainTagImageContainer");
const zoomLevel = document.getElementById("zoomLevel");
const buttonContainer = document.getElementById("buttonContainer");
const tagArea = document.getElementById("tagArea");

const zoomContainer = document.getElementById("zoomContainer");
const zoomLabel = document.getElementById("zoomLabel");
const wheelDirection = document.getElementById("wheelDirection");
const positionTable = document.getElementById("positionTable");
const positionLabelCell = document.getElementById("positionLabelCell");


const mX = document.getElementById("mX");
const mY = document.getElementById("mY");
const oX = document.getElementById("oX");
const oY = document.getElementById("oY");

const rmX = document.getElementById("rmX");
const rmY = document.getElementById("rmY");
const roX = document.getElementById("roX");
const roY = document.getElementById("roY");

const pTop = document.getElementById("pTop");
const pLeft = document.getElementById("pLeft");
const pWidth = document.getElementById("pWidth");
const pHeight = document.getElementById("pHeight");

const rpTop = document.getElementById("rpTop");
const rpLeft = document.getElementById("rpLeft");
const rpWidth = document.getElementById("rpWidth");
const rpHeight = document.getElementById("rpHeight");
const colorList = ['darkblue', 'darkgreen', 'darkgoldenrod', 'darkmagenta', 'darkgray', 'darkred', 'darkorange', 'darkslateblue', 'steelblue', 'darkslategray'];

var myConnectionId = '';

mainTagImage.style.display = 'none';
const randoId = `${(Math.random() * 100000000).toFixed(0)}${(Math.random() * 100000000).toFixed(0)}`;

console.log("rando", randoId);
const tagColor = colorList[+randoId.substring(0, 1)];

mainTagImage.addEventListener("mousemove", sendMouseMove);
mainTagImage.addEventListener("dblclick", addTag);
mainTagImage.addEventListener("wheel", (event) => {
    const zoomingIn = event.wheelDelta > 0;
    
    if(zoomingIn){
        zoomIn(false);
    } else {
        zoomOut(false);
    }
});

var addClass = function(elements, myClass) {
    if (!elements) { return; }
    
    if (typeof(elements) === 'string') {
        elements = document.querySelectorAll(elements);
    }
    else if (elements.tagName) { elements=[elements]; }

    for (var i=0; i<elements.length; i++) {
        if ( (' '+elements[i].className+' ').indexOf(' '+myClass+' ') < 0 ) {
            elements[i].className += ' ' + myClass;
        }
    }
}

var removeClass = function(elements, myClass) {
    if (!elements) { return; }
    if (typeof(elements) === 'string') {
        elements = document.querySelectorAll(elements);
    }
    else if (elements.tagName) { elements=[elements]; }

    var reg = new RegExp('(^| )'+myClass+'($| )','g');
    for (var i=0; i<elements.length; i++) {
        const d = ` ${myClass}`;
        elements[i].className = elements[i].className.replace(d,'');
        elements[i].className = elements[i].className.replace(reg,'');
    }
}

function sendMouseMove(e){
    mX.innerHTML = e.clientX;
    mY.innerHTML = e.clientY;
    oX.innerHTML = e.offsetX;
    oY.innerHTML = e.offsetY;

    const b = mainTagImage.getBoundingClientRect();
    pTop.innerHTML = b.top;
    pLeft.innerHTML = b.left;
    pWidth.innerHTML = b.width;
    pHeight.innerHTML = b.height;

    this.peerMoveEvent = {
        ChannelName: '',
        ClientX: e.clientX,
        ClientY: e.clientY,
        OffsetX: e.offsetX,
        OffsetY: e.offsetY,
        PeerTop: b.top,
        PeerLeft: b.left,
        PeerWidth: b.width,
        PeerHeight: b.height,
        SenderConnectionId: '',
        ClientId: randoId,
        Name: '',
        ProofId: '',
        ApprovalId: '',
        Metadata: {
            EventType: 'mm',
        }
    }

    mywsServer.send(JSON.stringify(this.peerMoveEvent));
}

function recvMouseMove(peermove){
    //console.log(peermove);

    var self = this;

    const b = mainTagImage.getBoundingClientRect();
    var offsetX = b.left;
    var offsetY = b.top;
    var diffX = 0;
    var diffY = 0;

    diffX = b.width/peermove.PeerWidth;
    diffY = b.height/peermove.PeerHeight;
    var x = (peermove.OffsetX * diffX) + offsetX;
    var y = (peermove.OffsetY * diffY) + offsetY;
    var shadowX = x - 50;
    var shadowY = y - 90;

    let isRemote = peermove.ClientId !== randoId;

    const same = 'same';
    if(!isRemote){
        addClass(peerCursorBoxContainer,"shadow");
        remoteUserNameText.innerHTML = 'my shadow';
        peerCursor.style.left = shadowX + 'px';
        peerCursor.style.top = shadowY + 'px';

        rmX.innerHTML = same;
        rmY.innerHTML = same;
        roX.innerHTML = same;
        roY.innerHTML = same;

    } else {
        removeClass(peerCursorBoxContainer,"shadow");
        remoteUserNameText.innerHTML = 'remote user';
        peerCursor.style.left = shadowX + 'px';
        peerCursor.style.top = shadowY + 'px';
        rmX.innerHTML = peermove.ClientX;
        rmY.innerHTML = peermove.ClientY;
        roX.innerHTML = peermove.OffsetX;
        roY.innerHTML = peermove.OffsetY;
        rpTop.innerHTML = peermove.PeerTop;
        rpLeft.innerHTML = peermove.PeerLeft;
        rpWidth.innerHTML = peermove.PeerWidth;
        rpHeight.innerHTML = peermove.PeerHeight;

        mX.innerHTML = same;
        mY.innerHTML = same;
        oX.innerHTML = same;
        oY.innerHTML = same;
    }
    
}

//enabling send message when connection is open
mywsServer.onopen = function() {
    mainTagImage.style.display = 'block';
    zoomReset();
    positionLabelCell.style.backgroundColor = tagColor;
}

//handling message event
mywsServer.onmessage = function(event) {
    //console.log("onmessage", event);
    const data = JSON.parse(event.data);

    switch (data.Metadata.EventType) {
        case 'mm':
            recvMouseMove(data);    
            break;
        case 'zi':
            zoomIn(data);
            break;
        case 'zo':
            zoomOut(data);
            break;
        case 'zr':
            zoomReset(data);
            break;
        case 'at':
            addTag(data);
            break;    
        default:
            break;
    }
}

const resetZoomPercent = 50;
var currentZoomPercent = 50;

var zoomIn = function(data){
    startAnimation();
    currentZoomPercent += 10;
    currentZoomPercent = currentZoomPercent > 100 ? 100 : currentZoomPercent;
    //console.log(data);

    let isRemote = data !== false;
    if(!isRemote){
        this.peerMoveEvent = {
            ClientId: randoId,
            Metadata: {
                EventType: 'zi',
                currentZoomPercent: currentZoomPercent,
            }
        }
        mywsServer.send(JSON.stringify(this.peerMoveEvent));
    } else {
        //console.log(data);
        currentZoomPercent = data.Metadata.currentZoomPercent;
    }
    mainTagImageContainer.style.maxWidth = `${currentZoomPercent}%`;
    zoomLevel.innerHTML = currentZoomPercent;
}

var zoomOut = function(data){
    startAnimation();
    currentZoomPercent -= 10;
    currentZoomPercent = currentZoomPercent < 20 ? 20 : currentZoomPercent;

    let isRemote = data !== false;
    if(!isRemote){
        this.peerMoveEvent = {
            ClientId: randoId,
            Metadata: {
                EventType: 'zo',
                currentZoomPercent: currentZoomPercent,
            }
        }
        mywsServer.send(JSON.stringify(this.peerMoveEvent));
    } else {
        currentZoomPercent = data.Metadata.currentZoomPercent;
    }
    mainTagImageContainer.style.maxWidth = `${currentZoomPercent}%`;
    zoomLevel.innerHTML = currentZoomPercent;
}

var zoomReset = function(data){
    mainTagImageContainer.style.maxWidth = `${resetZoomPercent}%`;
    
    currentZoomPercent = resetZoomPercent;
    zoomLevel.innerHTML = currentZoomPercent;

    let isRemote = data !== false;
    if(!isRemote){
        this.peerMoveEvent = {
            ClientId: randoId,
            Metadata: {
                EventType: 'zr',
            }
        }
        mywsServer.send(JSON.stringify(this.peerMoveEvent));
    }
}

var tagList = [];

var startAnimation = function(){
    stopAnimation();
    setTimeout(()=>{
        addClass(zoomLabel, 'elementToFadeInAndOut');
    },1);
}

var stopAnimation = function(){
    removeClass(zoomLabel, 'elementToFadeInAndOut');
}

var d = 0;
function addTag(e){
    const isRemote = e.ClientId !== undefined;
    
    if (isRemote) {
        if(e.ClientId !== randoId){
            let b = mainTagImage.getBoundingClientRect();
            let offsetX = b.left;
            let offsetY = b.top;
            let x = (e.OffsetX) + offsetX;
            let y = (e.OffsetY) + offsetY;
        
            var shadowX = x - 30;
            var shadowY = y - 110;
            let m = new Tag(shadowX, shadowY, e.ClientId.substring(0, 3), e.Metadata.Color, currentZoomPercent);
            tagList.push(m);
            console.log("tagList", tagList);
            const newTag = `<span class='tag-list-item' style='background-color:${m.color};top:${m.y}px;left:${m.x}px'>${m.id}</span>`;
        
            tagArea.insertAdjacentHTML('afterbegin', newTag);
        }
    } else {
        let b = mainTagImage.getBoundingClientRect();
        var offsetX = b.left;
        var offsetY = b.top;
        var x = (e.offsetX) + offsetX;
        var y = (e.offsetY) + offsetY;
    
        var shadowX = x - 33;
        var shadowY = y - 115;
        let m = new Tag(shadowX, shadowY, randoId.substring(0, 3), tagColor, currentZoomPercent);
        tagList.push(m);
        console.log("tagList", tagList);
        const newTag = `<span class='tag-list-item' style='background-color:${m.color};top:${m.y}px;left:${m.x}px'>${m.id}</span>`;
    
        tagArea.insertAdjacentHTML('afterbegin', newTag);
        pTop.innerHTML = b.top;
        pLeft.innerHTML = b.left;
        pWidth.innerHTML = b.width;
        pHeight.innerHTML = b.height;

        const peerMoveEvent = {
            ChannelName: '',
            ClientX: e.clientX,
            ClientY: e.clientY,
            OffsetX: e.offsetX,
            OffsetY: e.offsetY,
            PeerTop: b.top,
            PeerLeft: b.left,
            PeerWidth: b.width,
            PeerHeight: b.height,
            SenderConnectionId: '',
            ClientId: randoId,
            Name: '',
            ProofId: '',
            ApprovalId: '',
            Metadata: {
                EventType: 'at',
                Color: tagColor
            }
        }
        console.log("add tag peerMoveEvent", peerMoveEvent);
        mywsServer.send(JSON.stringify(peerMoveEvent));
    }
}

class Tag {
    constructor(x, y, id, color, zoomPercent){
        this.x = x;
        this.y = y;
        this.id = id;
        this.color = color;
        this.zoomPercent = zoomPercent;
    }
}