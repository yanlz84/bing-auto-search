// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.322
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
var default_search_words = ["坚守党校初心 服务工作大局", "天坑溶洞垃圾10层楼高 当地通报", "“6元鸡排讲出了6亿项目的气魄”", "“横竖”都是世界第一", "玄学大师落网时被问“算到被抓吗”", "哈尔滨图书馆回应3千至4千招聘硕博", "韩国面向中国免签政策今起试行", "坠机身亡主播“唐飞机”是驻村干部", "男子欠5000被催债后说每分钟还50", "去世8年男子坟墓惊现盗洞", "沈佳润出场 小沈阳被抬走", "乌鲁木齐南山发生暴雨山洪系谣言", "向太回应“向家破产”传闻", "李在明：诚挚道歉", "游客称在景区遭遇21474836元停车费", "62岁叶童首次跨界央视主持", "男子当街殴打女子被退伍军人飞踹", "吴艳妮12秒90夺冠", "国际顶尖肺癌专家宣布已患肺癌三年", "肖战《整晚的音乐》嗨翻全场", "女子称婆婆吃邻居送的蘑菇中毒去世", "美国密歇根州枪击事件已致2死8伤", "苏醒回应晚会唱歌跑调 网友：别嘴硬", "刘宇宁《新鸳鸯蝴蝶梦》带着江湖气", "佟丽娅母子首次同台献唱", "魏大勋闫妮晚会状态像微醺局", "泰国男子骑摩托射击边防士兵被击毙", "肖战唱完 林依轮感叹“哎哟我的娘”", "马达加斯加发生骚乱 华人商店被烧抢", "河南一马路雨后被大片白色泡沫覆盖", "孩子们在导弹发射井上“蹦蹦跳跳”", "印度一集会40人因踩踏身亡", "男子称偶遇野生东北虎 距离不到3米", "巨幅五星红旗飘扬在太行山间", "柯洁发文自称三连霸", "万斯称美考虑向乌提供“战斧”导弹", "俄方：普京愿与特朗普在莫斯科会晤", "俄对乌发动大规模袭击 泽连斯基发声", "欧美强搞制裁 伊朗强硬回应", "波兰外交部：波兰驻乌使馆遭袭", "听单依纯唱《君》感觉被净化了", "陈德容萧蔷合唱《一帘幽梦》", "美国“杀妻案”男子庭审前吸毒身亡", "伊朗军方：已准备好应对任何威胁", "波外交部：有炮弹击中该国驻乌大使馆", "多地回应“推迟普职分流”建议", "大润发月饼疑似含禁用添加剂", "徐怀钰周洁琼合唱《踏浪》", "俄称乌军袭击致别尔哥罗德州停电", "一大一小藏马熊闯入村庄民宅", "哈马斯：以进攻致两名被扣押人员失联"]

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
