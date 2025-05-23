// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.64
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
var default_search_words = ["习近平同法国总统马克龙通电话", "朝驱逐舰下水事故最新调查结果公布", "美暂停哈佛大学招收国际学生资格", "美国“芯”机算尽 难阻中国", "中国海警依法对菲船只喷射水炮", "武大回应校门被淹1米深：每年都这样", "被工作人员碰餐盘 孙颖莎急忙制止", "小米汽车首款SUV小米YU7发布", "蔡明居然是贾冰的干妈", "雷军：别指望自研芯片上来就碾压苹果", "雷军：小米YU7没有三十几万下不了台", "广西贪官家中发现大量金砖？假", "51岁曹颖自曝患胃癌", "黄杨钿甜父亲将面临什么处罚", "白宫官员首次公开承认：特朗普怕了", "Claude 4大模型能连续工作7小时", "女子白宫见特朗普 因一脸嫌弃而走红", "黄杨钿甜父亲涉故意隐瞒违法生二孩", "法拉利 小米", "陈坤儿子大学毕业 父子俩合照庆祝", "雷军谈小米YU7隐藏式门把手", "小米手表S4发布：搭载玄戒T1手表芯片", "孙颖莎连追6分逆转比赛", "高管与女员工接吻被辞索赔百万", "26岁女孩出门全副武装防晒致骨质疏松", "教育部拟同意设置32所新大学", "孙颖莎三次防住对方男选手倒地爆冲", "武汉暴雨袭城 有隧道积水超3米", "男子躲深山7年“手搓”300辆车", "国乒男双全军覆没 创本世纪最差纪录", "多地出现狗拉车带人上路急驶", "解压“捏捏”玩具博主自称患癌", "白酒三巨头集体失守千元线", "当“关系户”混进央视盗墓剧", "人躺在ICU居然写下欠条 法院判还钱", "男子跑步后未擦汗感染马拉色菌", "一盒助眠药从20元飙涨到100多元", "凌晨2点消防员背老人涉水求生", "林志玲戛纳金色蝴蝶结抹胸造型", "王楚钦让二追四 超级逆转进8强", "印度派出7支“朱砂行动”全球宣讲团", "“中国天眼”发现罕见掩食脉冲星", "陈妍希一瘸一拐去酒吧与付辛博聚会", "孙颖莎4比2胜申裕斌 晋级女单八强", "林诗栋横扫卡尔伯格晋级八强", "王楚钦说换球衣是世界杯后想的办法", "张家界暴雨洪水从家中穿流而过", "黄杨父亲曾承诺无违纪违法 欢迎举报", "雷军现场拿小米YU7对比ModelY", "谷歌或面临美国司法部反垄断调查", "潘展乐：状态不好对不起他们"]

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
