// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.185
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
var default_search_words = ["跟着总书记的足迹探寻中华文脉", "男生错付1010元车费 索要无果自杀", "全球110多个国家发现基孔肯雅病毒", "中国已建成全球最大高铁网", "用“冰”做的录取通知书", "这个暑期 旅游旺季不旺了", "捏造“粪水”谣言 邵某豪被刑拘", "孙菲菲曝业内贪污乱象", "合资车怎么突然又好卖了", "学历贬值 大一新生涌入实习岗", "强奸大嫂杀人男子辩称自己是受害者", "公职人员回应下班兼职送外卖", "好莱坞知名男演员被海浪卷走身亡", "多方回应女子称被女儿学校老师性侵", "57岁金星巴黎街头被偶遇", "宝妈回应6个月宝宝双眼间距过宽", "万元手表卖不动 Swatch甩锅给中国", "现在流行的口红为什么都不红了", "湖南一3岁娃独自骑6公里平衡车", "杜宾犬未拴绳起冲突 养狗人登门道歉", "张予曦毕雯珺为剧宣接吻被批尺度大", "大爷大娘排队贴摘豆角甲片", "应届生拒绝offer被HR威胁业内封杀", "3月赚94万 北京一黄牛获刑10个月", "润田创始人之妻自曝家丑", "强奸大嫂再杀人案检方建议维持原判", "在美中国女子遭囚禁虐待内幕曝光", "特朗普又决定“退群”", "保安提前到岗猝死家属发声", "德云社相声演员阎鹤祥自曝当爸", "3岁男童从18层高楼坠下奇迹生还", "中学喜报“指责”高分学生拒报清北", "行车记录仪拍下小车“凭空出现”", "男子每天1斤酒喝出“河马颈”", "微信测试新功能：可自动发送消息", "媒体评千万粉丝网红不露脸开演唱会", "马斯克正式进军餐饮业", "19岁小伙失联1个月 定位显示在缅甸", "内塔尼亚胡真中毒了还是在演戏", "涉案男子：嫂子将见义勇为者推向刀口", "KKV回应“顾客拿试用指甲油涂脚”", "中国游客泰国被树砸身亡 家属发声", "3000元一件 宠物服饰变金矿", "山姆从“闭眼买”变“不敢信”", "律师解读真人CS致玩家坠亡谁来担责", "王楚钦：赢得世乒赛冠军是解脱", "女子孕期347斤平安生下6斤男婴", "孔雪儿今日大婚造型头饰比头大", "家长称儿子遭霸凌发帖曝光班主任", "特斯拉开出全球首家餐厅", "泡面和座套背后是高铁乘客的痛点"]

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
