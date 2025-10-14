// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.352
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
var default_search_words = ["习近平在全球妇女峰会提出四点建议", "eSIM手机来了 移动联通电信均开通", "业主私挖300平地下室致32户开裂", "逆势向上！中国外贸增速逐季加快", "林诗栋比赛时无人机飞过整懵解说", "中方对美船舶收取特别港务费正式施行", "净网：网警带你看“网恋女友”杀熟局", "湖南知名主持人罗刚突发心脏病逝世", "巴军方出动重炮和坦克轰击阿边境", "微信员工回应好友互删后互动清除", "尹锡悦宣布戒严当晚总统府监控曝光", "北京热力辟谣代缴采暖费可打折", "特朗普：全世界又开始喜欢以色列了", "被主持人闭麦 美国副总统万斯怒了", "男子捡来的乌龟养了9年胖到爬不动", "加沙停火协议文件在埃及签署", "特朗普演讲遭抗议者打断 现场噘起嘴", "女子过安检丢了90克金手镯", "驴友爬山捡幼蛇轮流抚摸 专家：剧毒", "男子到山东认祖 问路问到亲叔叔", "秋季带状疱疹进入高发期", "王楚钦在印度真的很小心", "大爷憋了半辈子终于能说了", "马斯克第二代星舰最后一次试飞", "男子10年上班路免费搭1156名乘客", "林永健《人民日报》撰文", "山姆配送员电动车挂满大件货物", "泰国半夜放恐怖音乐 柬告到联合国", "莫言谈刀郎改编《聊斋志异》", "景区雕塑被指恐怖 园方：已部分拆除", "贵州珠宝店百万黄金被盗 嫌犯落网", "男子4个月偷菜18次获刑6个月", "石破茂：在首相官邸谁也不说真话", "中国成功打造聚变堆“盾牌”", "山东济南29岁失联男子确认身亡", "荣宝斋疑卖齐白石假画被判赔320万", "中国“夸父”又有新跨越", "北方稀土及关联方被监管警示", "美政府停摆第13天 美财长称影响经济", "上海浦东新区通报“鸭腿套餐有活蛆”", "鸡排哥一份鸡排只赚2元", "马克威廉姆斯西安大奖赛夺冠", "中方回应巴阿边境武装冲突：感到担忧", "GALA乐队为GALA加油", "宫权受贿6628万 投案当月还在捞钱", "中国蓝盔女子步兵班年龄最小21岁", "亚锦赛女团：中国3比0泰国", "海外网友点赞复兴号雨里赶路", "广州多区依法查处防蚊不力单位", "加密货币强劲反弹 超18万人爆仓", "内塔尼亚胡向特朗普赠送金鸽子雕塑"]

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
