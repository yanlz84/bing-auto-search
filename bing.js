// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.436
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
var default_search_words = ["一个博物馆就是一所大学校", "习近平同特朗普通电话", "日本机场挤满了回国的人", "“数”说非遗绽放夺目新光彩", "高市早苗G20上演外交灾难", "网店用AI生成模特试穿视频画面诡异", "净网：网警揭露直播间“托儿”真面目", "中国军装设计令人泪目", "李在明回应高市早苗涉台言论", "男童家门口落水 母亲施救双双遇难", "韩国演员“国民爷爷”李顺载去世", "网民冒用英烈警号行骗被刑拘", "日本又迈出凶险一步", "矢野浩二：看到有人攻击中国很难沉默", "特朗普签令启动“创世纪计划”", "热门中概股多数上涨 百度涨超7%", "普通感冒与流感如何区分", "人民海军发布视频《降妖除魔》", "多地流感疫苗接种预约激增甚至满员", "被亲姐指控吸毒成瘾 菲律宾总统发声", "男装水洗标文字被质疑歧视女性", "俄罗斯将被邀请重返G8", "外交部回应“日方称已多次解释”", "日本如何一步步解禁集体自卫权", "石破茂等日本3位前首相再表态", "日本旅游业遭重创 酒店老板诉苦", "近到看到对方表情 解放军驱离外军机", "航拍万人涌入地里“偷甘蔗”", "日本熊本市大规模市民集会抗议", "三只松鼠回应员工入职要改“鼠”姓", "救命药滞留前台5小时致男子身亡", "中国将寻找第二颗地球", "官方通报“彝族老人被围堵拍摄”", "以军空袭黎巴嫩贝鲁特意欲何为", "中国暂停租借大熊猫给日本", "美股收盘 谷歌特斯拉暴涨逾6%", "4岁女孩高烧40℃腿疼确诊甲流", "某游戏用“看广告得奖励”招募间谍", "业主12瓶茅台被保洁员调包盗窃", "以色列称将大量引入印度人", "俄方回应“欧洲版和平方案”", "珍稀植物“寄生花”连续3年如期绽放", "北川经纪人曝Jwei流拍", "乌方公布其和平立场三条“红线”", "欧洲对美“28点计划”提出重大修改", "蔡磊喉肌萎缩吞咽困难", "美乌谈判现场乌代表紧张到掰断笔", "印度战机坠毁地点卫星画面公布", "希腊紧急采集2026年冬奥会备用火种", "毛宁用日文转发王毅外长表态", "流感进入高发季 病毒变异了吗"]

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
