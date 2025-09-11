// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.286
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
var default_search_words = ["胜利日的难忘瞬间", "政治盟友遭枪击身亡 特朗普：降半旗", "贩毒8kg 毒贩因检举禁毒大队长免死", "2025年“最美教师”名单公布", "亚洲最大地下综合交通枢纽来了", "郑州提醒：市民非必要不外出", "81岁甲骨文创始人妻子是34岁中国人", "特朗普盟友遭枪杀 拜登奥巴马发声", "湖南男子驾车碾死同学被判死缓", "多省首富今年换人 其中有两位85后", "王毅同美国国务卿鲁比奥通电话", "所谓7天瘦13斤液断减肥法系误导", "牛弹琴：美国又全国降半旗了", "辽宁有望诞生一世界级金矿", "“中国未下单” 美方急了", "枪击特朗普政治盟友的嫌疑人已获释", "三星掌门人之子放弃美籍回韩服兵役", "女子点的外卖蒸蛋上被写侮辱字母", "小学校长守校门口拦截教师节礼物", "微信又有新功能 再也不怕发错群了", "女高管遭老板性侵：仅获2万多赔偿", "以军袭击卡塔尔 白宫简报室挤爆了", "台湾高雄发电厂发生爆炸", "被短暂超越后 马斯克重新回世界首富", "游客将茶卡盐湖铺路盐成袋装走", "85后副市长周伟被查", "117名韩国女性首次直接起诉美军", "太飒了！女生军训秀中国舞惊艳全场", "那英社交平台内容全部隐藏", "汉奸石平曾被日本官员痛批", "27岁小伙相亲20多次患“惊恐障碍”", "六旬老人退休后竟“闲出病”", "扬州“越狱”卡皮巴拉喜提泳池别墅", "男子抢60张刮刮乐 刮20张中410元", "美媒炸了：卡塔尔都被打 下个会是谁", "古巴全国电力中断", "甲骨文股价飙升36%创近33年最大涨幅", "阿里美团激战升级", "中国森林食物年产量已突破2亿吨", "这些年轻人为何偏爱租赁消费", "一图看懂黄岩岛国家级自然保护区", "山西博物院回应拟录用多位海归博士", "卡塔尔首相誓言报复以色列袭击", "有人动武有人“浇油” 欧洲剑指俄", "NASA副局长：要在月球上击败中国", "相声演员曹云金教无语哥打快板", "受贿3835万！范福生被判15年6个月", "星巴克员工曝卖不出月饼垫钱自购", "“00后”老师花式整顿课堂", "墨总统：愿与中方携手提升两国关系", "iPhone17系列值不值得买"]

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
