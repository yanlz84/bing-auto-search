// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.128
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
var default_search_words = ["山海情深向未来", "特朗普：以色列和伊朗已同意全面停火", "伊朗官员称伊朗接受停火方案", "“您的快递丢了” 警惕短信新骗局", "北大连夜上门“截胡”713分尖子生", "是谁在批量制造“厌学小孩”", "伊朗向美军基地发动导弹袭击", "兰州市长、原市长等169人被问责", "国产剧翻拍的风还是吹到了《潜伏》", "一商店20多年共来了42窝燕子筑巢", "伊朗官员：特朗普停火声明是挑衅伎俩", "清远地震致小区地面开裂？不实", "成都发生3.6级地震", "特朗普：伊朗回应非常软弱", "特朗普：伊朗袭击美军基地前通知美方", "伊朗首都多地再次传出爆炸声", "内塔尼亚胡要求暂不评论以伊停火", "柬埔寨公主现身深圳吃椰子鸡", "伊朗打击美军驻卡塔尔基地 多方谴责", "老谢公开李雪琴相关公司账务信息", "曝千万粉丝男明星隐婚生子还出轨", "以军向德黑兰两地居民发布疏散令", "伊朗夫妇辗转6天到昆明参展", "胖东来发文回应“关闭多家门店”", "中方回应伊朗拟关闭霍尔木兹海峡", "牛弹琴：伊朗10天内被骗了至少3次", "伊袭美军基地：多枚导弹冲上夜空", "清远地震 广州深圳等地有震感", "广东省地震局回应清远地震", "558元一碗面店主称探店有剧本", "男孩中考查分863分数学满分", "袭击美军基地后 伊朗民众上街庆祝", "岚图高管称小米YU7像网红奶茶", "全国各地高考成绩查分时间", "专家：锁霍尔木兹海峡或致油价飙涨", "伊朗最高领袖：绝不接受任何侵犯", "伊以停火致国际油价走低 金价下跌", "伊军方：美国袭击让伊朗放开了手脚", "美股三大指数集体收涨 特斯拉涨超8%", "广东清远发生4.3级地震", "清远地震画面曝光 地面明显晃动", "互联网平台企业涉税报送新规落地", "纽约原油重挫超5%", "男子公海上因琐事冲突刺死同事被捕", "中方：美对伊核设施打击性质恶劣", "中国电影女角色暌违14年完成新突围", "海湾多国宣布重新开放领空", "特朗普决定轰炸伊朗的幕后推手是谁", "清远4.3级地震 学生下楼避险", "男生被教官体罚做1000深蹲致换肾", "金价高企催生铂金“平替”"]

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
