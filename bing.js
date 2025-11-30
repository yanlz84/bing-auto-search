// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.447
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
var default_search_words = ["事关“最大变量” 习近平最新部署", "香港火灾已致146人遇难 100人仍失联", "高市早苗再次有意犯错", "中国航天7次太空接力名场面", "特朗普与委总统通话 直接要求其下台", "章莹颖被害8年 父母未获1分钱赔偿", "他们的照片不用再打马赛克了", "假奶粉何以一路畅行销往全国", "英法爆发大规模游行", "跟女友通话传来陌生男声？答案来了", "25岁小伙工作中上吐下泻 下班后离世", "新疆喀什地区水利局辟谣禁止冬灌", "狗在路中间睡觉司机鸣笛无效后辗压", "“人造肉第一股”退出中国", "香港火灾失踪名单中159人确认安全", "新郎婚礼上被朋友掏手机求续火花", "澳大利亚总理任上结婚 澳124年来首次", "奶精淀粉勾兑的假奶粉都流向了哪里", "卖手机壳比卖手机还赚钱", "“中国有众杠杆惩罚 东京毫无手段”", "荒野求生决赛“苗王”住上一室一厅", "爱马仕继承人被骗150亿美元细节曝光", "台海军陆战队中尉哨亭内击发枪支身亡", "云南大理92岁白族奶奶逆袭为画家", "柬埔寨越南等多国最新涉台表态", "央视解读“吸毒记录可封存”", "白岩松：日本不要高估了自己", "日本官方发布高市名场面 网友：黑粉", "日本前议员：高市早苗已不具首相资格", "新华社：水库大坝质量红线不容触碰", "香港预计今天完成所有火灾房屋搜索", "“东北文旅一到冬天就杀疯了”", "日本京都著名景点突发火灾", "多部门回应假奶粉销往全国", "普京催青年科学家要孩子：这事得抓紧", "283.1万人参加国考笔试", "空中突击不再是西方专利", "五星级酒店的“剩菜盲盒”真香了吗", "涉嫌腐败 以色列总理正式请求赦免", "章莹颖父亲希望赴美再寻女儿尸骸", "军事动作不断 高市早苗意欲何为", "乌代表团赴美谈判 俄乌互相袭击", "金正恩：朝鲜空军装备新战略军事资产", "幼师等招聘可依法查询吸毒记录", "人为什么短时间能感冒好几次", "中国文化第一大省为何又是广东", "机器人日租价格跳水式下跌", "宁波地铁回应广告被吐槽“诡异”", "香港特区政府：将全速进行调查工作", "香港为火灾受灾民众提供免费住所", "老人深更半夜打车埋现金 司机报警"]

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
