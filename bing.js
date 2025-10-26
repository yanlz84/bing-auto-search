// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.376
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
var default_search_words = ["从一份蓝图 看见中国的明天", "深圳机场深夜致歉 郑智化回应", "2000多年前的人脸认证", "8个高频词一起学习四中全会公报", "男子买马一觉醒来1匹变2匹", "女子参加荒野求生14天后瘦成闪电", "郑丽文重用连战马英九吴敦义大将", "山东姑娘赵娜获环球小姐中国总冠军", "80天3人遇难 深圳知名公园紧急提醒", "首次！中国芯片领域取得新突破", "西方多国就乌克兰问题发表联合声明", "网民造谣发生爆炸伤亡不明被查处", "中国光刻胶领域取得新突破", "18岁女大学生每晚用6瓶酒精冲洗小腿", "徐正文：我们是台湾人更是中国人", "“鸡排哥”南京巡炸4小时卖出1000份", "世界最大航母逼近拉美", "特朗普：“国际部队”不久将进驻加沙", "网红“馆长”抵达北京", "今年的秋天去哪儿了", "记者体验16元护肤 手机被拿走贷款", "这位“健身教练”来自三星堆", "“双十一”为什么越来越早了", "马頔称想收“爷们儿要脸”版权费了", "贵州法庭唱山歌调解矛盾视频火了", "谁“偷走”了5A景区的游客", "大量燕子滞留 它们为啥来不及南飞", "科考人员发现1400年前人类活动遗迹", "王晶曝王祖贤离开娱乐圈原因", "英伟达退场 国产GPU接棒", "唐国强唱《以父之名》版权费都省了", "徐尚贤举办“台湾光复节”车队游行", "俄罗斯发动大规模夜袭", "女生称卖黄金被套路杀价200元1克", "南方滑雪场10天吸引30万人次", "保时捷前三季度营业利润暴跌99%", "以色列在加沙炸死一名杰哈德成员", "男子花4000元买“祖传药”成本仅5元", "日本新型H3火箭7号机发射升空", "央视中文国际频道迎新主播徐睿思", "那些在抗日战场上的台籍将士们", "直-10ME接令就是精准打击", "巴西总统：一个国家不能无视他国主权", "台湾海峡发生3.5级地震", "吉林延边发生5.5级地震", "派系纷争不断 加沙秩序恢复仍需时间", "吉林省抗美援朝后援地展览开展", "中核工程师谈“人造太阳”超骄傲", "太阳系星际访客4天后抵达近日点", "下周我国大部气温小幅回升", "石洵瑶张翔宇女双夺冠"]

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
