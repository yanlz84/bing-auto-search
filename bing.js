// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.181
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["万里行程映初心", "甘肃通报幼儿血铅异常：6人被批捕", "香港三层高游轮如玩具被大风吹走", "一图了解三伏天的9个真相", "天水市委书记市长被立案问责", "71岁成龙断崖式衰老", "沙特沉睡王子因车祸昏迷20年后去世", "甘肃疾控中心违反规程且阻碍调查", "男婴离世律师拿55万赔款：愿退还39万", "近百台小米YU7流入二手车市场", "铅中毒涉事幼儿园周边无铅污染情况", "杭州水务集团干部刘某某潜逃？假", "家里“吧唧”太多女孩深夜中毒送医", "八旬老人想过继孙子遭儿媳赶出家门", "女演员微波炉煮蛋被炸伤眼睛", "“骑哈雷的小姨”去世 知情人发声", "知情人：在美卖酱香饼小伙无合法执照", "甘肃涉事园长也食用添加颜料的食品", "12个人的AI公司融了两个亿", "直击苏超：常州vs徐州", "直击苏超：苏州vs镇江", "小米SU7 Ultra被曝开了4天趴窝", "俄罗斯远东1小时连发4次强震", "《长安的荔枝》破两亿领跑暑假档", "直击苏超：扬州vs南京", "#现场直击台风韦帕登陆#", "直击苏超：无锡vs淮安", "为何高铁泡面之争网友吵翻天", "40岁“彩铃顶流”歌手回应隐身10年", "美国男子戴金属链闯核磁共振室丧命", "幼儿园用颜料做面点发朋友圈吸引家长", "被骗至缅甸19岁高中生已移交中方", "法媒：癌症治疗传来四条好消息", "台风“韦帕”在广东台山沿海登陆", "越南下龙湾游船倾覆现场曝光", "新闻女王团走过来感觉气血都足了", "球迷开直升机去看苏超", "中国女篮大胜韩国收获亚洲杯季军", "韦帕登陆 珠海风力加强海水倒灌", "内娱最“狠”的真人秀杀疯了", "福耀科技大学何以吸引高分考生", "吴艳妮现身成都人气爆棚", "警方回应小马倒在隧道大马拦路求助", "过家家儿童玩具100度高温220伏电压", "陈晓低调现身韩红演唱会 状态略沧桑", "抗日将领幼子用微信名缅怀父亲", "《罗小黑战记2》票房突破1亿元", "男子盗保时捷叫代驾开回老家炫耀", "折叠屏iPhone定价或超15000元", "外卖小哥从10余米高桥面跳河救人", "北约扬言占领俄飞地 俄称小心核报复"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
