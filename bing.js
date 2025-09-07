// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.278
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
var default_search_words = ["总书记同亿万人民共筑新家国记忆", "辛芷蕾夺威尼斯电影节最佳女演员奖", "劝老外取消订单劝不住", "阅兵多个画面首次公开", "“南北两重天”继续上演", "美海豹突击队曾潜入朝鲜？特朗普回应", "20岁女大学生35天穷游7国仅花万元", "武汉高校迎2米“巨人”新生", "女子看京剧发现后排坐着洪秀柱", "大学毕业生做体育外卖月营收近10万", "毛新宇一家参加九三阅兵", "广州辟谣“小程序可办排污登记”", "官方通报高校花75万采购299元路由器", "中元节禁忌是对传统节日的曲解", "鲍蕾和陆毅在一起30年没做过饭", "四川6名消防人员训练时落水 2人失踪", "樊振东收获德甲两连胜", "哈工大新生回应军训在野外住帐篷", "演员黄泽锋报喜：58岁妻子诞下二胎", "东部战区回应加澳军舰过航台湾海峡", "辛芷蕾获奖感言", "交给国家两年 小哭包爆改硬汉型男", "许奶奶已经不是当年的许奶奶了", "民警张进军被网友“扒”出来了", "男子不满13条狗半夜叫 毒死9只获刑", "武汉一路口突发车祸致7伤 司机被抓", "佩通坦社媒发文深情告白：满怀感谢", "韩美罗生门：超300名韩国人在美被抓", "易会满被查 中国证监会发声", "健身博主卖减脂馒头爆单", "谢娜晒爸妈金婚全家福", "歼-20歼-20A歼-20S同框压迫感好强", "乌克兰难民在美轻轨上被刺身亡", "美媒：美国防部或出现重大政策变化", "“小甜水”扎堆 酒企盯上了年轻人", "加拿大代表团访华谈油菜籽出口", "大熊猫国家公园平武片区现金猫", "今年已有8名正部级官员落马", "以色列民众大规模示威要求加沙停火", "月食曾为地球是圆的提供关键证据", "大鹏海关发现未申报武士刀120把", "像“龙鳞”一样的新型雷达有多厉害", "白宫晚宴上库克2分钟连说9次谢谢", "南京知名商场巨头遭索赔近5200万", "亚裔女子在泰被沉尸 警方锁定嫌疑人", "美国一AI模型扬言禁止中企使用", "中国驻日本大使馆介绍东风-5C", "今日白露节气", "泽连斯基提议：普京可以来基辅", "苑举正看到武警纹丝不动深受感动", "王钰栋独造7球"]

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
