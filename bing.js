// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.345
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
var default_search_words = ["在赓续传承中推动文化进步", "李强凭吊中国人民志愿军烈士", "中方回应美禁止中国航班飞越俄领空", "看民政工作交出暖心成绩单", "高通被立案调查", "路边这种小果子别捡别吃", "趵突泉锦鲤胖成“猪鲤”", "中国65岁及以上老年人口达2.2亿", "开了自动驾驶就不算醉驾？法院判了", "北方为何雨这么多 还要下多久？", "200斤小伙醉酒坠江 漂浮7个小时被救", "官方辟谣医保可报销药品仅占2%", "殡仪馆回应婚礼跳河新郎遗体已找到", "泰国坠崖孕妇离婚案宣判：准予离婚", "山西省原省长金湘军被“双开”", "外交部回应赖清德“双十”讲话", "王暖暖回应离婚成功：终于等到这一天", "男子被关295天后无罪释放 获赔21万", "多地考编打破35岁门槛", "辽宁一小学开学1个月后关闭", "委内瑞拉：美国可能很快动武", "中泰美侦破特大毒品案 缴获冰毒近5吨", "701万彩票大奖无人领 将纳入公益金", "下雨天女儿请吊车帮父母收玉米", "中国已公告新命名地名60多万个", "交通运输部：对美船舶收取特别港务费", "记者违规拍摄新武器并播出导致泄密", "日本或于本月20日举行首相指名选举", "谁是巴以冲突最大赢家？专家解读", "证监会原发审委主任委员郭旭东被查", "现在的锦旗也太“卷”了", "菲律宾南部海域发生6.9级地震", "美政府“停摆” 本周超2万航班延误", "徒步搭子向高反失温女孩母亲道歉", "墨西哥为何突然暂停50%关税提案", "NASA报告：地球正在“变暗”", "顾客在胖东来茶饼发现毛发获赔千元", "以军宣布加沙停火协议已生效", "日本公明党退出执政联盟", "河北一地提前开启供暖模式", "肯德基汉堡里吃出活虫 当地回应", "多地规范无堂食外卖", "男孩后空翻碰倒靠垫 女孩出手相助", "张继科回应带货争议", "俄30枚导弹450架无人机袭乌能源设施", "英国投资平台警告：比特币不是资产", "干部痴迷“翻翻鸽” 4年受贿95只", "这所高校的“攀树课”一课难求", "杜特尔特释放请求被驳回 将继续羁押", "朱立伦：期盼新任党主席让国民党更好", "国防部：“台独”拼凑造潜艇自不量力"]

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
