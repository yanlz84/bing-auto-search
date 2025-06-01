// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.82
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
var default_search_words = ["加快建设教育强国", "外交部深夜发声：勿要玩火", "樊振东加盟德国乒乓球甲级联赛", "这些端午节的别名你知道吗", "新王加冕！巴黎5比0国米首夺欧冠", "陈小春演唱会上座率高得惊人", "巴基斯坦上将聊歼-10CE嘴角压不住", "演员贾冰减肥成功瘦到脱相", "年轻人开始主动挂艾草了", "刘浩存王安宇吻戏借位遭吐槽", "划龙舟有多拼 鼓点一响全员开挂", "孩子淋雨演出老师打伞观看？假", "河南鹤壁一水库水位下降现千佛石窟", "印度首次承认印巴冲突中战机被击落", "陈小春演唱会郑伊健当嘉宾", "贾乃亮晒与甜馨端午节合照", "姆巴佩发文祝贺巴黎夺冠", "香港影坛“第一恶人”去世", "66条预警齐发！浙江将迎大风暴雨", "刘德华用粤语送端午祝福突然断片了", "南派三叔《九门》电视剧官宣阵容", "亿万富翁错失NASA局长提名 白宫回应", "景区救人后朱迅获新身份", "尊界S800上市24小时大定达1600台", "江一燕《晚安》很治愈", "余承东谈智驾：要鼓励真牛 打击吹牛", "国米0-5创欧冠决赛最大分差", "叶童陈丽君穿越时空浪漫相遇", "莫迪：想让全世界都吃上印度食品", "黄健翔谈大巴黎5-0国米夺欧冠冠军", "香港演员方刚去世巨额遗产继承成谜", "樊振东莫雷加德成为队友", "登贝莱有望角逐金球奖", "龙舟赛现卡点翻船 刚过线就侧翻", "苏有朋古巨基两代五阿哥同台合唱", "郑钦文今日战萨姆索诺娃", "央行5月开展7000亿元买断式逆回购", "国防大学副校长驳斥：中方不接受", "普通遥控器竟牵出10亿元大案", "《水饺皇后》成为5月票房冠军", "俄称控制定居点 乌称打击俄纵深目标", "赵奕欢被小鬼感动到大哭", "多地网友目击夜空不明飞行物", "女子长期被迫吸二手烟痛苦地猛洗澡", "香港富豪5分钟订走3台百万级豪车", "俄一桥梁被炸坍塌 已致数十人伤亡", "长三角铁路客流创新高", "哈马斯提交加沙停火提议回应", "大巴黎夺冠狂欢超市遭“零元购”", "印军高官为何指责83架光辉订单0交付", "开播飙到8.8分 今年又一爆剧来了"]

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
