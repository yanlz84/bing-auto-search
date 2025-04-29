// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.16
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
var default_search_words = ["跟着总书记探寻文明之光", "外交部：不跪", "巴方：你断我们水 我就让你断气", "关税冲击如何应对", "美企老板：还不如一把火烧了库存", "网红汤匙被录取 北大：不知是网红", "酒店机器人3年亏了8个亿", "男子1450元变卖路边僵尸车被拘", "张柏芝说当妈后没时间处理男女关系", "00后女生坚持带癌上班一年半", "外交部回应老外带大行李箱来华扫货", "太空出差182天都不能洗澡？假", "美国“杜鲁门”号航母一战机坠海", "曝女生去宿舍捉奸被推下楼 大学回应", "《哪吒2》出品人回应饺子闭关", "泽连斯基承认乌情报部门刺杀俄高官", "新娘因长相太美被质疑AI换脸", "小孩哥说放春假待在家写作业最舒服", "狄波拉带俩孙子看谢霆锋演唱会", "任贤齐方否认买下青岛一条街房产", "被曝售假货 刘美含发视频道歉", "三姐妹被大伯炸死案二审未当庭宣判", "保时捷CEO谈小米SU7Ultra", "王毅：妥协退缩只会让霸凌者得寸进尺", "俄军将停火72小时 白宫表态", "中国成功发射卫星互联网低轨卫星", "西班牙进入国家紧急状态", "永辉超市“反向抹零”引争议", "全红婵家人声音被AI合成冒用带货", "国家发改委：建立实施育儿补贴制度", "外媒：罗德里戈可能被皇马出售套现", "巴防长：印度“军事入侵”迫在眉睫", "学生课堂做实验 突出意外多处烧伤", "汪峰女友森林北首次直播带货", "#朝鲜为何此时公开承认兵援俄罗斯#", "两男子起口角 女友劝架秒变求婚现场", "黄渤称未来电影应与AI共生", "多家银行一把手触及60岁“红线”", "王毅会见俄罗斯外长拉夫罗夫", "医师出轨暴露违规问题更需关注", "胡塞称再次袭击美军和以色列目标", "阿利森谈夺冠：我们付出了太多牺牲", "媒体：男子取超长怪名是滥用公共资源", "“高潮针”概念股集体大跌", "乌外长：实现和平须以准确评估为基础", "游客私自采摘枇杷该如何理赔", "寻子18年的母亲团圆5个月后去世", "青铜器记录了古代曾有三不像动物", "夫妻俩因为孩子丢失 35年几乎不说话", "投资者资金涌向拉美ETF", "警方通报男子开临牌车碰撞两名行人"]

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
