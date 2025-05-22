// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.62
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
var default_search_words = ["奋进中原", "朱媛媛遗体已火化", "特朗普会见南非总统时起争执", "外国游客“买买买” 中国购更火了", "朝鲜驱逐舰出事故 金正恩目睹全程", "一级演员陈丽云被逮捕", "朱媛媛住院治疗照曝光", "日本选手战胜国乒后激动捂脸痛哭", "为什么越来越多年轻人患癌", "网红方脸猴“大壮”突发疾病离世", "朱媛媛患病后一直希望奇迹出现", "有图就有真相吗？警惕AI图片造假", "朱媛媛赵英俊都是因癌症去世", "活期存款接近零利率", "小米3nm自研芯片成色几何", "天价耳环事件真是公众集体仇富吗", "坠楼生还女子回应被调侃“老公失望”", "朱媛媛演的《贫嘴张大民》有多经典", "54岁“雪姨”王琳获国标舞比赛季军", "特朗普带货手表闹乌龙：名字印成臀部", "萝卜快跑一季度全球订单超140万", "68岁摩的司机性侵女生被判3年6个月", "全国跳水冠军赛 全红婵退赛", "“重量级”游客雇3名轿夫抬轿下山", "省委书记下矿井", "降息潮下有银行上调一年期存款利率", "上海孤老去世 邻居要求分一半房产", "辛柏青换蜡烛头像悼念朱媛媛", "李乃文深夜发文悼念朱媛媛", "美股三大指数均创一个月来最大跌幅", "大学生坠亡化粪池 事发地现状曝光", "具俊晔金宝山看望大S被偶遇", "车辆异响发现2米长眼镜王蛇", "父亲卖5套房送两儿子留洋学球", "倒卖蜜雪冰城柠檬水当事人发声", "玉米蛋挞火了", "朱媛媛亲戚称其非常低调", "#众星悼念朱媛媛#", "袁爷爷吴爷爷离开4年了", "巴基斯坦警告印度：我们不是巴勒斯坦", "云南装载机致人伤亡事件致6死4伤", "王曼昱4-1击败对手晋级16强", "村民在外务工老宅被拆 镇政府：误拆", "B太称好心照顾大爷生意反被骗", "歼10CE模型成兰卡威海空展打卡点", "长安启源Q07开启大规模交付", "加沙多地遭袭击 以军发大规模撤离令", "财政部：1-4月证券交易印花税收535亿", "林诗栋说混双输了很可惜", "张稀哲达成国安生涯400场里程碑", "花50万带娃环球旅行父亲回应"]

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
