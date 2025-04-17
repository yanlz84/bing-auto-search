// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.18
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

var max_rewards = 60; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 9; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["习近平会见柬埔寨国王西哈莫尼", "美国要退出世贸组织？WTO总干事回应", "黄仁勋紧急来华谈什么", "中国和马来西亚互免签证", "中国在关税较量中被指有多张王牌", "科学家发现太阳系外可能存在生命", "公安机关公布10起网络谣言案件", "曝黄仁勋会见DeepSeek创始人梁文锋", "西双版纳机场偶遇孙杨", "外交部：美滥施关税严重损害各国利益", "武契奇：天塌下来我也要去见普京", "吴晓求称别让东方集团跑了", "姥爷用橘子瓣给外孙上数学课", "上海闹市一飞驰摩托车飘落“钞票雨”", "儿媳每月给婆婆3000元感谢其帮带娃", "黄仁勋再访北京 没穿皮衣改穿西装", "男子42岁“提前退休”被罚近40万元", "戴手铐关禁闭 多名赴美游客遭拘留", "金价创新高 投资客砸150万狂买黄金", "相亲次日闪婚 40天后18岁新娘跑了", "特朗普吹牛1天征20亿美元关税遭打脸", "金喜善48岁状态", "章若楠“素颜”出演不说话的爱", "加州州长：我孩子大部分玩具中国产", "特大地磁暴爆发！多地现震撼极光", "贵州纪委原副书记张平贪4772万受审", "南京掀起挖“橄榄石”热", "高圆圆吃糖耳朵直呼帕梅拉白练", "日本偶遇杨采钰孕肚明显", "“巨型鱿鱼”首次被“目击”", "广东廉江一家三口遭同村村民杀害", "中央提级巡视第二天 昆明2人落马", "130万粉丝网红“天齐的路”被约谈", "8个月女婴被饿成皮包骨 当地回应", "联想出AI换脸防诈技术 准确率超96%", "《奔跑吧》发布会李晨带兵马俑入场", "46名外籍女子被拐卖入境 卖给单身汉", "刘亦菲黄玫瑰限时返场", "日本15岁女高中生当街被害", "定期存款额度“秒光” 5年期消失", "认养一头牛广告被指嘲讽打工人", "外国公司暂停撤离俄罗斯的计划", "女子重度抑郁治愈送999朵玫瑰谢医生", "年轻人看电影再也坐不住了", "天安门执勤哨兵向百岁老兵敬礼致敬", "南昌一楼盘房价打4折？售楼部回应", "全红婵解锁冲天炮辫子造型", "钟汉良朱珠吻戏", "女主播3年顿顿外卖患上胃癌", "国家教育整改政策在宁波遇阻", "韩执政党党鞭当众拖拽女记者"]

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
    let randomDelay = Math.floor(Math.random() * 20000) + 10000; // 生成10秒到30秒之间的随机数
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
            // 检查是否需要暂停
            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function () {
                    location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
                }, pause_time);
            } else {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            // 检查是否需要暂停
            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function () {
                    location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
                }, pause_time);
            } else {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
