// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.275
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
var default_search_words = ["从伟大胜利走向伟大复兴", "外媒酸中国装备没实战 评论区翻车", "古巴国家主席看到满墙华为笑了", "亲爱的战友们 这盛世如你们所愿", "舰载激光武器：我哪里像“洗衣机”了", "电影《731》预售票房破1000万", "医生将350万灰色收入存保姆账户被花", "俄罗斯：绝不接受外国军队在乌部署", "溜出去50多个小时 这只和平鸽刚到家", "九三阅兵女民兵方队领队是一名乡长", "外交部：中方同意加入《纽约宣言》", "人社部辟谣“花钱考证才能入职”", "#26国派兵援乌为何要等俄乌停火#", "上海夫妻遭遇现实版“寄生虫”", "桃李面包称领导正接受现实毒打", "詹姆斯中国行 保镖辱骂驱赶球迷", "欠缴房屋税款 英国副首相辞职", "酒馆表演被指擦边 文旅部门：已叫停", "中方回应特朗普将国防部改战争部", "足协将公开选聘中国男足主教练", "中方回应泰国选出新任总理", "普京：俄罗斯将对中国免签", "特朗普饭桌上挨个要钱", "受阅女民兵回家了 车站内整齐列队", "阿努廷将出任泰国新任总理", "错过等三年！罕见“红月亮”将登场", "普京：想向乌克兰派兵？敢来就打", "儿童火车票有新规定了", "外交部：菲方挑衅言行必将付出代价", "河南女学子参加阅兵后光荣归校", "电影《731》发布勿忘版预告", "大学生返校纷纷带上各地特产", "女子捡到戴脚环的鸽子 获鸽主人送养", "泰国新总理会开飞机还精通乐器", "韩国议长：与金正恩握手就是成果", "外交部奉劝菲方不要再扮跳梁小丑", "院士揭秘歼35为何成阅兵顶流", "富商立遗嘱10亿美金给内马尔", "人均曾近万的米其林餐厅撑不住了", "“当年你救了我 现在我成了你”", "55岁林依轮发怼脸视频自证未整容", "法国一博物馆3件中国瓷器被盗", "列车突然广播 全车人为他们鼓掌", "“3女带4孩续面”面馆招牌已拆除", "阅兵的兵哥哥脸上留Y字印记", "委战机接近美军舰 五角大楼发警告", "阅兵的“神级镜头”是这样切换的", "26国将向乌克兰部署军队", "中方敦促有关国家勿在南海兴风作浪", "特朗普发布与普京合影", "福建泉州中元节用火寄托哀思"]

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
