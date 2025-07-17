// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.174
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
var default_search_words = ["人民城市人民建 人民城市为人民", "美国阿拉斯加沿海发生7.3级地震", "官方呼吁不要对16岁产妇二次伤害", "警惕这些高温防暑误区", "特朗普手背抹遮瑕膏 白宫：握手太多", "宗氏三兄妹起诉宗馥莉文书曝光", "某科技公司未落实网安保护义务被罚", "韩红现场叫停录制说要对观众负责", "前央视主持人全网寻跪继父坟前的他", "男婴离世家长获赔88万 律师拿走55万", "高温热浪来袭！局地体感温度超45℃", "官二代遛狗打人？成都辟谣", "网红：上海政府送了我200平房子", "警察称能从缅甸捞人 骗取18万后被抓", "美阿拉斯加州海啸警报响起 民众避难", "印航机长关闭燃油开关或直接导致坠机", "特朗普称解雇鲍威尔“可能性极低”", "马斯克与特朗普争执后更换手机号", "特朗普“50天最后通牒”引猜测", "特斯拉新车Model Y L预计售价40万", "印度大规模猥亵事件478名男性被捕", "女童患病要求退年卡 景区捐款", "邱贻可回应争议", "男子寄107万元油卡遭快递员变卖", "#娃哈哈遗产大战让钟睒睒口碑翻盘#", "吴英杰受贿3.43亿余元被判死缓", "警方通报3名高中生赴西双版纳后失联", "父母代签孩子清华录取通知书时哭了", "特朗普“顺走”世俱杯冠军奖牌", "网红钟美美再谈被家暴", "北约秘书长威胁制裁巴西中国印度", "日本主帅有信心赢中国", "中方回应北约威胁对中国等二级制裁", "生父回应把孩子塞后备箱：不会道歉", "#助力每一个缅北失联孩子回家#", "胡塞武装称袭击以色列多处目标", "伊朗外长：感谢中方", "媒体评男孩与亲爸后妈远行坐后备箱", "女童患病 景区捐许愿池硬币和5万元", "黄仁勋称华为AI芯片将取代英伟达", "以军袭击加沙多地 至少81人死亡", "德国总理将正式访问英国", "加州州长爆粗口痛骂特朗普", "哈梅内伊：伊朗准备好应对新军事打击", "叙内政部门宣布达成新的停火协议", "巴黎被印度博主疯狂吐槽", "比利时著名音乐节场地发生火灾", "乌总理辞职将转任国防部长", "哈梅内伊：伊朗能对美实施更沉重打击", "比特币突破12万美元/枚", "以色列为何介入叙南部武装冲突"]

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
