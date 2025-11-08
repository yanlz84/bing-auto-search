// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.402
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
var default_search_words = ["习近平出席福建舰入列授旗仪式", "全国50强城市又变了", "被欠物业费1200万 物业退出不干了", "进博会上的“全勤生”", "人民网评：“人民咖啡馆”不妥", "安徽天柱山“高颜值保安团” 走红", "14岁初中生作文看哭全网 本人回应", "福建舰夜泊军港 入列当晚灯火辉煌", "中国已进入呼吸道传染病高发季", "土耳其对内塔尼亚胡发逮捕令", "张家界荒野求生百人参赛仅剩17人", "成都龙泉山将举办荒野求生赛不实", "这种羽绒服穿得越久危害越大", "单亲妈妈手脚残疾 用嘴绣鞋垫养家", "西安市委书记方红卫被查", "福建舰甲板上面都有啥", "这些电动车12月1日后禁售", "马斯克点赞小鹏机器人", "1.8元打车？“网约公交车”来了", "北京飞悉尼惊现-43元票价 客服回应", "委内瑞拉总统：我在美国比霉霉都红", "女子带快递纸盒买黄金 店员立即报警", "郑丽文表示将祭拜吴石将军", "“杭州六小龙”首次同框谈了些什么", "装修工人触电身亡婚房变“凶宅”", "30岁小伙长期熬夜智力退回3岁", "南极一冰川两个月没了近一半", "女子婚后3年不孕查出男性染色体", "网红公路垮塌 3000村民出行受阻", "刘大刚四大名著演了三部", "特朗普：希望在布达佩斯与普京会晤", "“唐僧”迟重瑞悼念刘大刚", "53岁男子50天徒步1500公里回家", "带摄像头的门锁能安吗", "iPhone 18 Pro或缩小灵动岛", "正直播NBA：猛龙vs老鹰", "六小龄童悼念刘大刚", "福建舰内部多个舱室首次曝光", "东北重要高铁线路 有了关键进展", "一油轮在索马里以外海域遭劫", "万相兰被双开 通报称其搞迷信活动", "黑救护车业务员在ICU走廊卷业务", "海南自贸港封关就绪", "福建舰更多细节公布", "福建舰入列可震慑“台独”武装", "哈尔滨一小区内有人遛企鹅", "阿曼塔耶夫澄清与赵鸿刚并无恩怨", "朱婷率领河南女排掀翻卫冕冠军", "企业使用挥发性清洗剂 被罚56万元", "归家APP在两岸爆火 但软件是假的", "白宫宣布减肥药降价 药企高管晕倒"]

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
