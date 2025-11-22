// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.431
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
var default_search_words = ["观察“中国之治”的一个视角", "中方：如日方武力介入 将行使自卫权", "日本已付出代价", "十五运会为粤港澳带来哪些全运红利", "东部战区海军某部昼夜实弹射击", "自己拍的照片侵权视觉中国？案件判了", "上海一小区多套住房统一挂牌1460万", "“抛售日本”开始了", "实现祖国统一 解放军时刻准备着", "女子称丈夫花8万元网购70平海景房", "泽连斯基：要么失去尊严要么失去美国", "工业垃圾制造儿童面霜系谣言", "柬埔寨“江湖大嫂”口供曝光", "“疫苗之王”科兴内斗10年停牌超6年", "女子在数平米房间养育8孩 妇联：属实", "突然爱上香菜可能因为你老了", "“高市下台”响彻东京夜空", "高市毫无悔意 缅甸再发声：坚决谴责", "真人版偷甘蔗爆火：巡逻小狗累到趴下", "《哪吒2》不参评奥斯卡最佳动画长片", "日本人没米下锅了", "香港宣布：取消中学生赴日交流", "夫妻将房车停在校门口陪读", "中国航司大面积取消日本航班", "郑丽文高呼：两岸绝不可打仗", "两高中生奸杀女教师案申诉被驳回", "66岁奥斯卡影帝哭诉无家可归", "日本长期以核能掩盖核武能力", "中方致函古特雷斯阐明立场有何深意", "“中方使用迄今最强硬措辞”", "硕士体验送外卖 视频火了却停更了", "中国军网发视频：大子弹 量大管够", "上山放牧失踪3日的重庆女童找到了", "西安交大一附院再曝“瓣膜谜团”", "女子光脚踩水族箱擦玻璃 超市回应", "近700万粉丝网红被指欠薪", "放弃靠岸日本的中国邮轮改去越南", "这届年轻人为何钟爱“包挂”", "73岁短剧演员：每天工作14小时是常态", "黄仁勋急得用3个0描述对华芯片销售", "乌克兰：努力体面地结束", "台湾新党主席：警惕日本走侵略老路", "蚂蚁灵光4天破100万下载量", "日本犬舍发生大火约100只狗葬身火海", "英国首相平地走路险摔倒", "央视起底豪车碰瓷特大骗保案", "中国小伙接受日媒采访被恶意剪辑", "紫龙回应“实习生抽中显卡要上交”", "柬埔寨7男子扮宪兵专门勒索中国人", "莫言辟谣和史铁生余华偷瓜", "《狂野时代》被评看不懂"]

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
