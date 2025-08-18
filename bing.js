// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.239
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
var default_search_words = ["中流砥柱 民族先锋", "男子与儿子认亲2年后又一个儿子找来", "小学食堂员工获刑 77斤排骨被返还", "世运会闭幕焰火纯享版", "A股大涨 专家：正逐步转向全面牛市", "DeepSeek正在遭遇“中年危机”", "#本轮A股牛市原因是什么#", "妈妈疑意外去世 男童独自在家数日", "男子放弃继承亡父房产 法院：无效", "王晶谈蔡少芬演《甄嬛传》的无奈", "露营遇山洪10人遇难 出事地叫棺材山", "这些诈骗套路专盯你的钱", "15岁女孩被同班男生送回家途中杀害", "青铜器展柜内有一部手机 博物院回应", "“过七夕的钱已经到手 感谢大A”", "政协委员尹艳林：先让有钱人能消费", "高兴夫被查 曾当过近7年浙江副省长", "男子杀妻未遂获妻谅解：他是经济来源", "网友提议高铁站台禁烟 12306回应", "水利部：极端突发事件仍可能发生", "上海一路人疑被掉落的玻璃砸中去世", "律师称女孩卖男友不构成人口拐卖", "李连杰罕见公开手术过程", "瑞典大满贯：国乒再赢2场", "高铁上“逛吃逛吃”有了新选择", "A股收评：沪指创近10年新高", "暑期档票房破百亿《南京照相馆》领跑", "人民网评外卖大战：谁在卷 卷了谁", "胖东来招刑释人员要求刑期不超十年", "#谁是男篮本届亚洲杯最大功臣#", "美国女市长被曝婚内与保镖偷情", "女子只顾聊天婴儿车掉进鱼塘", "媒体：这是十年来最热血的中国男篮", "网友吐槽《献鱼》剧宣是职场性骚扰", "特朗普要先和泽连斯基“单聊”", "乱港分子称已获澳政府庇护 中方回应", "印度女留学生吐槽韩餐肉太多", "中方回应“普京与特朗普会晤”", "余承东：“遥遥领先”我讲得非常少", "威特科夫：美国不会将领土让步给基辅", "因制裁俄飞机在美加油只能支付现金", "夫妻旅游回家发现客厅爬满蛇", "11岁女孩长期吃素食查出矮小症", "河南郏县通报“苏文33亿元投资”", "泽连斯基：乌克兰不能再被迫放弃领土", "奶奶怀疑男子性侵孙女 砍伤对方获刑", "宛平城内的留声亭火了", "新股民现在应该注意什么", "外交部回应德国外长涉华言论", "又一个“双机场”地级市来了", "暴雨为何爱挑上下班时间“凑热闹”"]

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
