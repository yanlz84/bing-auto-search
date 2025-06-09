// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.98
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
var default_search_words = ["在奋斗中释放青春激情", "“解放洛杉矶” 特朗普下令结束暴乱", "新华社记者在洛杉矶被催泪弹打中", "外资企业持续投资中国", "C罗40岁夺生涯第36冠 赛后激动落泪", "火车过山西隧道吸入煤灰 乘客变煤蛋", "演员张译回应“息影”", "俄军首次进入乌克兰中部腹地", "高三姑娘们向张桂梅道别：我们爱你", "牛弹琴：美国“内战”开始了", "王自如：在格力工资是以前几分之一", "女子因偷两根小米辣被拘？假", "美国洛杉矶警方向抗议人群开枪", "万斯：马斯克炮轰特朗普是巨大错误", "游客被打副所长拉偏架被免职不冤", "考生因金属纽扣无法进考场 众人解围", "女排世联赛北京站：中国队2胜2负收官", "洛杉矶爆发冲突后 纽约也乱了", "浙江一村40多户养了上百万条蛇", "闫妮在华强北拍摄短剧《奇迹》", "金巧巧自曝30年前就做过医美", "洛杉矶警方称抗议活动“平安结束”", "特朗普团队被曝考虑报复马斯克", "C罗：为国家队就算断一条腿我也认", "高考作文题里的穆旦是谁", "阿尔卡拉斯卫冕法网冠军", "梁实结束英语考试：口语只会说Hello", "加州州长要求特朗普撤回国民警卫队", "葡萄牙夺得欧国联冠军", "街道办副科长假卖拆迁房骗4.28亿", "张家界溶洞垃圾问题4人被停职", "王楚钦谈输给伊朗14岁小将", "太想赢 点球大战C罗全程不敢看", "《临江仙》第十一集预告", "欧国联：姆巴佩传射建功 法国2-0德国", "部分银行暂停五年期大额存单发行", "中国女排2-3不敌土耳其", "男子刷视频发现失踪半年妻子在结婚", "莱万：我将暂时退出波兰国家队", "多名网友在深圳华强北偶遇闫妮拍戏", "男子驾驶摩托车超速行驶谎称去高考", "今起中国免签“朋友圈”再增4国", "苏-35竟被击落？谁对它威胁最大", "美国加州纽约乱成一锅粥", "重庆通报“游客吃烧烤3人花780元”", "全国已有27个省份延长婚假", "2025高考短跑冠军诞生了", "去年中国海洋生产总值突破10万亿", "哈里斯：特朗普刻意在加州挑起混乱", "A股市场情绪有望持续回暖", "曝委内瑞拉政府计划上调油价50%"]

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
