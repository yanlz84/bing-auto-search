// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.15
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
var default_search_words = ["习近平的劳动故事", "外交部回应李嘉诚卖港口：望审慎行事", "普京宣布将停火72小时", "朋友圈什么不能发？网警提示", "中方回应朝鲜确认向俄罗斯派兵", "四川一贪官从会场被带走画面曝光", "23岁异瞳小伙在无人区拍治沙走红", "郭晶晶夫妇现身李兆基丧礼", "上海车展太养眼了 秒变时装周", "外交部：中美元首近期没有通话", "任贤齐方否认买下青岛一条街房产", "太空出差182天都不能洗澡？假", "刘美含方回应被指卖假货", "金价飙涨致备婚三金成本激增", "麦子阿姨想带老公去旅游", "四川广元发生4.1级地震", "巴基斯坦中国造装备能否抗衡印度", "特鲁姆普打出赛季100杆破百", "秦沛姜大卫尔冬升同框", "《淮水竹亭》刘诗诗一身素衣惊艳出场", "苹果将推出20周年纪念版iPhone", "雄鹿主场不敌步行者大比分1-3落后", "刘德华把刘以豪钓成翘嘴", "杨昊谈新一届女排教练组分工", "刘诗诗张云龙《淮水竹亭》今日开播", "俄中将被炸身亡作案过程披露", "成都河道发现疑似人形物体 消防打捞", "男子回应跑马闯女子赛道被禁赛3年", "官方回应游客私摘枇杷每个赔100元", "发改委：不买美粮食对中国没什么影响", "谢霆锋发演唱会收官长文", "特朗普支持率为80年来美总统最低", "今年首个“蛇年蛇月蛇日蛇时”来了", "8岁女孩开灯突然爆炸 全身58%烧伤", "五一预计日均215万人次出入境", "美的格力都说自己是“空调第一名”", "凤阳用青史作诗迎接八方旅人", "两部门下拨667亿中央就业补助资金", "财政部：3月全国发行新增债券4375亿", "刘亦菲发表获奖感言时紧张到手抖", "战觉城格斗夜云南临沧站", "以色列释放11名被扣押巴勒斯坦平民", "律师谈石凯与前女友恋爱保密协议", "疑似赵丽颖和神秘男子带儿子郊游", "小米YU7新增835公里续航版本", "#朝鲜为何此时公开承认兵援俄罗斯#", "胡杏儿下次想和孙俪演好姐妹", "孕妇不慎摔倒 3名路人下车救助", "国羽晋级苏杯八强", "国安：跟海港真刀真枪干一场", "蒋一侨寸头变长发太甜了"]

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
