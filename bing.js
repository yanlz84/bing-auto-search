// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.32
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
var default_search_words = ["三个关键词看习主席俄罗斯之行", "一夜之间印巴大打出手", "商务部：中方决定同意与美方接触", "外贸企业如何突出重围", "印向巴发射导弹 巴击落印战机", "巴方称已击落6架印度战机", "特朗普称印度对巴军事行动“可耻”", "巴基斯坦宣布进入紧急状态", "央行证监会等将重磅发声", "中国女游客为捞相机命丧87米海底", "国米7-6巴萨进决赛", "上海一女子阻挡高铁关门？假", "河南老人强拦婚车讨喜烟 被特警驱离", "巴方称印军发动24起袭击已致8死", "胖东来京东联手了", "美财长：对中国145%关税无法长期维持", "歌手苟伟离世 年仅45岁", "母女三人骑电动车被撞飞数米倒地", "赵心童女友是剑桥大学硕士", "公司成立仅6天就拍得水库经营权", "零跑汽车五一订单超1.8万台", "专家：高潮针没有确切研究证实其效果", "两年期英债收益率跌4个基点", "AMD一季度营收74.4亿美元超预期", "伊万盯上42岁新门将隋维杰", "7只转债评级遭下调", "小米汽车回应智驾更名：响应国家号召", "默茨当选德国总理", "女租客欠租后失联 40平公寓变垃圾场", "菲出动海警拦截中国科考船意欲何为", "电梯大王25亿元股权由配偶一人继承", "刘强东回应“凑76个鸡蛋上大学”", "美政府被指建地下城市供富人避难", "黄仁勋：人工智能将提高全球GDP", "警方通报女网红被指涉殴打霸凌事件", "成都蓉城B队4-0十人广西蓝航", "荣昌五一卖出29万只卤鹅", "云南省司法厅党委书记茶忠旺被查", "苏丹港机场航班恢复正常", "赵心童12岁退学拜师学台球", "A股半导体“盈利王”易主", "五一跨区域人员流动量超14.65亿人次", "特朗普称已预测到印度袭击巴基斯坦", "曝张镇麟将在6月初举办婚礼", "俄表示伊朗有权发展自己的核能项目", "黄仁勋：没有任何事是有保障的", "年轻人开始租三金结婚", "中方呼吁为波黑解决分歧创造条件", "德尚将观战巴黎对阿森纳", "微软推出低端平板电脑以推广AI工具", "中欧全面取消交往限制"]

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
