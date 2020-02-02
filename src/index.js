let data = require('./lipstick.json')

var lipstickData = null;
var width = 0;
var height = 0;
var zr = null;

function init() {
  width = Math.floor(window.innerWidth);
  height = Math.floor(window.innerHeight);
  var bgDom = document.getElementById('bg');
  bgDom.setAttribute('width', width);
  bgDom.setAttribute('height', height);

  var zrDom = document.getElementById('zr')
  zrDom.setAttribute("width", window.innerWidth)
  zrDom.setAttribute("height", window.innerHeight)
  zr = zrender.init(zrDom)
  initLipstickData(data)
  initPoint(lipstickData)
  hover({ target: lipstickData[0].group.childAt(0) });

}

// 规格化数据
function initLipstickData(rawData) {
  lipstickData = []
  let bsize = rawData.brands.length
  for (let bid = 0; bid < bsize; ++bid) {
    let brand = rawData.brands[bid]
    //每个系列下对象 
    for (let sid = 0, ssize = brand.series.length; sid < ssize; ++sid) {
      let lipsticks = brand.series[sid].lipsticks
      lipstickData = lipstickData.concat(lipsticks)
      // 单个口红对象
      for (let lid = 0, lsize = lipsticks.length; lid < lsize; ++lid) {
        lipsticks[lid].series = brand.series[sid]
        lipsticks[lid].brand = brand
      }
    }
  }
}

// 初始化个体 排列方形图案
function initPoint(lipstickData) {
 for (let i = 0; i < lipstickData.length; ++i) { 
  let line = Math.ceil((i+1) / 10)
  let posX = (i - line * 10) * 60 + 1230
  let posY = line * 80
  var pos = [posX , posY]
   
  var fillColor = `rgb(${lipstickData[i].color})`
  var point = new zrender.Heart({
    shape: {
        cx: 0,
        cy: 0,
        width: 20,
        height: 30
    },
    style: {
        fill: fillColor,
        stroke: '#fff',
        lineWidth: 1
    },
    position: pos
  });
  var text = new zrender.Text({
    style: {
      text: lipstickData[i].name,
      textAlign: 'center',
      fontSize: 12,
      textFill: 'rgba(255, 255, 255, 0.01)'
    },
    position: pos
  });
  
  var group = new zrender.Group()
  group.add(point);
  group.add(text);
  zr.add(group)
  
  group.lipstick = lipstickData[i]
  // 挂载原型上 防止丢失
  group.lipstick.group = group
 }
 
 zr.on('mousemove', hover)
//  click颜色替换到中间
//  zr.on('click', function () {

//  })
}

var lastHighLightGroup = null;   //上一个重点强调
var notNormalGroups = [];

function hover(el) {
  // hover到未定义的画布上
  if((!el.target || el.target.parent !== lastHighLightGroup) && notNormalGroups.length) {
    normal(notNormalGroups);
    notNormalGroups = []
  }

  if (el.target) {
    if (lastHighLightGroup !== el.target) {
      // hover 正确
      var group = el.target.parent;
      hightlight(group)
      notNormalGroups = [group]
      lastHighLightGroup = el.target.parent
    }
  }
  else if (lastHighLightGroup) {
    for (var i = 0; i < lipstickData.length; ++i) {
        undownplay(lipstickData[i].group);
    }
    lastHighLightGroup = null;
}
}
// hover到强调项
function hightlight(group) {
  undownplay(group)
  let point = group.childAt(0)
  point.animateTo({
    shape: {
        cx: 0,
        cy: 0,
        width: 25,
        height: 40
    },
    style: {
      lineWidth: 3,
      stroke: '#fff',
      shadowBlur: 20,
      shadowColor: 'rgba(0, 0, 0, 0.5)'
    }
  }, 300, 0, 'bounceOut')

  let text = group.childAt(1)
  let id = group.lipstick.id ? group.lipstick.id : ''
  text.attr('style', {
    text: '#' + id + ' ' + group.lipstick.name,
    textPadding: [54, 0, 0, 0]
  });
  text.stopAnimation(true)
  text.animateTo({
    style: {
      textFill: `rgb(${group.lipstick.color})`,
      fontSize: 16,
      textStrokeWidth: 3,
      textStroke: '#fff'
    }
  }, 300, 0, 'bounceOut')
  updateBubble(group.lipstick)
}

// 普通项
function normal(groups) {
  for (var i = 0; i < groups.length; ++i) {
      var point = groups[i].childAt(0);
      point.attr('z', 1);
      point.stopAnimation(true);
      point.animateTo({
          shape: {
            cx: 0,
            cy: 0,
            width: 20,
            height: 30
          },
          style: {
              stroke: 'rgba(255, 255, 255, 0.8)',
              lineWidth: 1,
              shadowBlur: 0
          }
      }, 300, 0, 'cubicOut');

      var text = groups[i].childAt(1);
      text.stopAnimation(true);
      text.attr('style', {
          text: groups[i].lipstick.name,
          textPadding: 0
      });
      text.attr('z', 0);
      text.animateTo({
          style: {
              fontSize: 12,
              textStrokeWidth: 0,
              textShadowBlur: 1,
              textFill: 'rgba(255, 255, 255, 0.01)'
          }
      }, 300, 0, 'cubicOut');
  }
}

// 没有hover到有效项时
function undownplay(group) {
  var point = group.childAt(0);
  point.stopAnimation(true);
  point.animateTo({
      style: {
          opacity: 1
      }
  }, 300, 0, 'cubicOut');

  var text = group.childAt(1);
  text.stopAnimation(true);
  text.animateTo({
      style: {
          opacity: 1
      }
  }, 300, 0, 'cubicOut');
}

function updateBubble(lipstick) {
  document.getElementById('brand-name').innerText = lipstick.brand.name
  document.getElementById('series-name').innerText = lipstick.series.name
  document.getElementById('lipstick-name').innerText = lipstick.name
  document.getElementById('say').innerText = lipstick.description
  document.getElementById('brand-name').innerText = lipstick.brand.name
  document.getElementById('description').setAttribute('style', 'color:' + `rgb(${lipstick.color})`);
  document.getElementById('bubble').setAttribute('style', 'background-color:' + `rgb(${lipstick.color})`);
}

init()
