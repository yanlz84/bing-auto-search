// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.195
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
var default_search_words = ["中欧“大个子” 携手下一个50年", "少林寺：释永信正接受联合调查", "释永信与多名女性有染并有私生子", "10省份大到暴雨 紧急情况这样避险", "少林寺：释永信涉嫌挪用侵占寺院资产", "有些大学专业又悄悄火了", "北方搞不好也要遍地广式双马尾了", "雅鲁藏布江水电站开工第一吊", "北京密云85岁老人：没见过这么大的水", "日均开机短剧100部 郑州成“竖店”", "多人被录到马来分校要复读 厦大回应", "洪水来时驾车可以快速逃离？误区", "洪水冲走千万金饰目前只找回1公斤", "北京为何出现特大暴雨", "“窝囊旅游”为啥这么火", "泰柬双方将在马来西亚举行会晤", "旺仔小乔掉粉已超300万", "没考上 高校发“未录取通知书”", "杨洋新剧不油了", "全球首个！这一岛国计划全体移民", "陈梦否认已结婚领证", "#直击北京密云洪水#", "岳云鹏演唱会观众喊了几十次退票", "李小冉回应删何炅微信：以为天又塌了", "网友吐槽8小时高铁乘客打电话7小时", "百年历史建筑起拍价7777.77万元", "医院称朱雀玄武敕令多次扬言自杀", "汪苏泷对张碧晨还是太心软了吗", "北京密云突发洪水 游客凌晨跳窗逃生", "渤海4.4级地震 秦皇岛东营有震感", "金店称愿给洪水冲走金饰归还者酬金", "山西载12人中巴车因强降雨失联", "释永信曾说“有问题早都成问题了”", "26岁女干部当选全国重点镇副镇长", "释永信20天前最后一次公开露面", "李雪琴与男友现身毛不易演唱会", "泰柬双方军队继续相互打击", "印度1岁男童咬死眼镜蛇奇迹生还", "中国14岁女生夺帆船世界冠军", "“窝囊漂流”一天卖出门票近40万元", "一家6口空调房煲糖水4人中毒", "载12名务工者车被洪水冲走 村民发声", "郭麒麟：老好人讲不了脱口秀", "石宇奇首夺中国公开赛男单冠军", "北京密云暴雨引发洪水 有村庄被淹", "朱雀玄武敕令自曝被送精神病院", "樊振东乒超12连胜", "医学生飞机上救人 被质疑有无资质", "张碧晨《年轮》海外版疑下架", "男子偷女友7万黄金卖钱给她花", "青岛现真人版“闪电侠”"]

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
