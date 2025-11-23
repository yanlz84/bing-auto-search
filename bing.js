// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.433
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
var default_search_words = ["攀“高”逐“新” 步履铿锵", "王毅：高市越了红线 中方必须回击", "“外交史上第一人”碑前出现这张照片", "重温十五运会那些精彩瞬间", "高市早苗G20找存在感 马克龙表情亮了", "黄豆豆破格提拔为副局级干部", "电车续航有望超过1000公里", "头发重新变黑的方法找到了", "警方回应印度旅游团义乌偷东西", "王毅：有权利对日本历史罪行再清算", "海关在一女子裙内查获229条活鱼", "河南一地铁站附近车祸致8死系谣言", "高市之祸来了 日本发出最强烈警告", "彝族老人在列车上遭游客围堵拍摄", "12岁失联双胞胎姐妹已找到", "高市为G20“精心打扮”惹争议", "高中学历“科学家”如何骗过层层审核", "石破茂再批高市早苗：不能过一时嘴瘾", "河南8岁女童随奶奶上坟途中走失", "女子支取亡夫养老金13万元获刑", "高市早苗个人账号评论区批评声不断", "自助偷甘蔗农场爆火后老板真没招了", "西贝30余道菜品全国降价", "小伙拍到秦岭“局部降雪”", "浙江一起21年前的命案破了", "雅思考试降价", "解放军多条备战表态 信息量很大", "男子潜伏约死群4年救下几百人", "“时间贫困”正在悄悄损害你的大脑", "为何印度空军事故频发", "刀疤哥：3万多元奖金已经转回家", "俞敏洪道歉：老板们也在拼命努力", "网约车“一口价”为啥会引发纠纷", "中国火箭军：假如战争今天爆发", "廉价合金首饰镉元素超标9000多倍", "万岁山武侠城10个月营收突破10.68亿", "火锅店误将燃料加入汤锅致11人入院", "财政部农业农村司原司长吴奇修被双开", "李嘉欣晒与许晋亨合照庆祝结婚17年", "12年前中国划设东海防空识别区", "98元一串糖葫芦何以被捧成“顶流”", "九尾官宣自由人", "高市早苗一系列举措遭揭批", "“偷甘蔗”后真人版“偷橘子”来袭", "俄罗斯莫斯科州一热电站遭袭起火", "缅军再出手清剿KK园区", "TES官宣Kanavi离队", "超市玩具被意外带走 萌娃主动送还", "英国确认将于2027年主办G20峰会", "王楚钦发文总结全运会", "美乌瑞士会谈在即 各方立场分歧明显"]

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
