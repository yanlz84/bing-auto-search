// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.355
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
var default_search_words = ["这是一次美美与共的盛会", "人去世了朋友圈会消失吗？微信回应", "多家银行关停旗下信用卡App", "用“卡路里”打开“十四五”这五年", "“南天门计划”新机型紫火首次亮相", "损害军队形象！一批自媒体账号被处置", "缅北魏家接班人残忍手段曝光", "突破！中国自研超高速实时示波器发布", "“黄河之水天上来”具象化了", "中方回应美击沉委内瑞拉海域船只", "国乒女团3-0日本夺亚锦赛冠军", "外地缴杭州社保享退休待遇系谣言", "蔡国强烟花秀事件通报：多人被免职", "黄子韬徐艺洋晒婚纱照", "外交部回应“特朗普威胁报复中方”", "阿富汗首都发生爆炸 现场冒起浓烟", "蔡国强工作室被立案查处", "老人为孙女回家停车铲掉门口花坛", "BLG爆冷0-1不敌100T", "世界最长人名念完需要20分钟", "陪看国乒男团冲击亚锦赛冠军", "缅北一个中国人卖30多万", "中方回应欧盟欲逼迫中企移交技术", "王自如曝格力高管工资7位数", "AL1-0击败HLE拿下首胜", "江苏一学院拟升格为大学", "女白领长途飞行后腿部肿胀生命垂危", "中方回应特朗普拟禁中美航班过境俄", "《再见爱人5》嘉宾官宣", "火箭鹈鹕爆发冲突", "巴基斯坦与阿富汗发生新的交火", "男子在村道上偶遇野生东北虎", "胖东来12年老员工未及时迎客被开除", "两名中国公民在柬埔寨跳车获救", "多地下雪了 广东：当心中暑", "新凯来子公司发布两款EDA设计软件", "#你那里下雪了吗#", "“县城羽绒服之王”口碑要塌了吗", "屠宰点藏身农家院 切开牛胸注水", "王世坚婉拒唱《没出息》", "“棉花糖爷爷”隔着栏杆投喂小学生", "高速上熊猫图案装置引争议 官方回应", "外交部：美方一边要谈 一边威胁恐吓", "南方还在吹空调 北方已经下雪了", "俄罗斯提供350页肯尼迪遇刺档案资料", "国乒女团高举国旗庆祝", "冷空气带来换季式降温 大暴雨将来袭", "中方对稀土出口管制目的是维护和平", "曝杜特尔特健康持续恶化 瘦成皮包骨", "特朗普威胁“暴力”解除哈马斯武装", "林永健发文批某些顶流演员排场很大"]

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
