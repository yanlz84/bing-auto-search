// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.50
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
var default_search_words = ["习近平向多哥新任领导人致贺电", "台当局威胁欧阳娜娜等20多名艺人", "母女就餐1小时未动筷老板报警", "中拉论坛从幼苗长成大树", "雷军官宣小米造芯", "郑钦文不敌高芙 交手记录0胜3负", "农行公布老人办业务期间离世时间线", "母亲殴打女儿致其死亡 已被刑拘", "“病重老人取钱死于银行”暴露了啥", "李连杰时隔50年重返金门大桥", "美国解除对叙利亚制裁 外交部回应", "贵阳现“不合理蛙”？专家辟谣", "刘晓庆回应被举报涉嫌偷税漏税", "百色教育局通报家长抱婴儿站护学岗", "中方不同意台湾地区参加世卫大会", "福建莆田8岁男童已走失十天仍无下落", "固高科技：看好多足和轮足机器人赛道", "男子失踪7年被找到 正躺桥洞玩手机", "外媒称中国迎来一个重要里程碑", "黄杨钿甜耳环风波", "91岁卧床老人需取钱银行半小时上门", "普京调整俄陆军高层人事任命", "犯强奸罪教师出狱办教培？官方通报", "郑钦文输球眼眶红了 独自背包离开", "国家药监局批准安瑞克芬注射液上市", "利比亚首都安全局势恢复稳定", "深蓝汽车CEO称员工购车可休息2个月", "中方呼吁让巴勒斯坦灾难日成为历史", "人民网评小米芯片即将问世", "业内：“美元信用崩溃”叙事被打断", "5岁女童被碾亡案被告车主首次发声", "台北市议员劝赖清德", "越南女子横穿铁轨被火车撞成重伤", "娃哈哈一边裁员一边找人代工", "曝Galaxy S25 FE配1200万像素前摄", "雷霆vs掘金", "销售回应湖北3.5元在售可乐是加量版", "机器人0.103秒还原魔方破世界纪录", "涉嫌在英首相住宅纵火男子被起诉", "记者：崔康熙将迎来正名之战", "杰曼：单场0分在我职业生涯很少见", "芒果一口气官宣88部大剧", "世卫组织报告：全球卫生领域进展放缓", "布朗：非常感谢到场的球迷", "莫拉蒂：我非常欣赏巴雷拉", "麦格理预计OPEC+7月将提高石油产量", "犯罪团伙用冥币厂做掩护狂印刷假币", "金靖演我看到迪丽热巴", "追梦：库明加去与留都祝他万事顺利", "胡塞武装再向以色列发射导弹", "中方呼吁胡塞武装停止袭扰商船"]

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
