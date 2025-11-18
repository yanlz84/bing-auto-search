// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.423
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
var default_search_words = ["合力开创法治中国建设新局面", "外交部：日方必须给中国人民一个交代", "49.1万张飞日本机票被取消", "全运赛场“00后”小将刮起青春风暴", "矢野浩二发文：永远支持一个中国", "中方穿五四青年服见日本官员", "日本官员低头听中方讲话", "马龙王楚钦领衔北京男团晋级决赛", "中方回应日方提醒在华日本人注意安全", "日本官员匆匆离开北京机场", "原声纯享“电磁龙吟”", "“南京地铁要通到无锡”系谣言", "连续8天！黄海南部进行实弹射击", "韩国召见日本公使严正抗议", "福建舰首次实兵演练细节曝光", "高市早苗或于12月26日参拜靖国神社", "台湾退役少校怒怼日本：千万别投降", "日本民众用中文高喊高市早苗下台", "中方当场驳回日方无理交涉并反交涉", "女子打赏男主播67万 丈夫痛哭", "欧阳震华与苗侨伟为许绍雄扶灵", "日本旅游“退退退”", "外交部回应日本官员来华磋商", "男子上厕所遇“艳遇”被骗11万余元", "福建舰入列后首次海上实兵训练", "女子手机丢在新疆3年后被人送回广东", "深圳一凶宅拍卖引30人争抢", "“荒野第一深情”要与女友见面了", "日媒给高市早苗指了一条明路", "江苏一4岁女童腹痛就医后缺氧去世", "22岁女生轻生 生前与辅导员有争执", "荒野求生“冷美人”获38000元奖励", "女子称身体能吸附硬币：被叫万磁王", "王曼昱缺阵女团半决赛", "学校排查牙龈出血病例？教体局回应", "东部战区发布重磅视频《归程》", "马斯克核心团队为何“集体叛逃”", "三明治吃出虫子 女子维权遭戏谑回应", "成飞的“背心哥” 其实是一群人", "全国首家烧烤学院正式开班", "高市早苗12年间参拜11次靖国神社", "外交部回应美国驻日大使涉华言论", "荒野求生14位选手进决赛 每人2万奖金", "动物园回应大猩猩抽烟手法娴熟", "和俞敏洪同游南极的奚老师是谁", "德国防长渲染2028年开战 俄罗斯回应", "特朗普支持公开爱泼斯坦案文件", "美日同盟是冷战产物 不应针对第三方", "日本新米交易价格再创新高", "多人退订日本环球影城门票", "宗馥莉缺席娃哈哈经销商大会"]

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
