// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.57
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
var default_search_words = ["在“大学校”感悟“何以中国”", "印称中国向巴提供防空系统 中方回应", "破纪录高温来了", "经济持续回升具有较多有利条件", "潘展乐200自夺冠 孙杨第八", "央视曝光怕被卫星拍到的垃圾山", "虞书欣父亲否认侵吞国有资产15亿", "华为首款鸿蒙折叠电脑23999元起售", "美的董事长：绝对不可能6点后还上班", "男子骑车摔倒以为没事 7天后死亡", "中央：党政机关工作会议一律不摆花草", "如何辨别AI生成的图片文字声音", "安在旭自曝在美突发急性脑出血", "荣昌区委书记呼吁吃鹅让羽毛球降价", "造谣陈奕迅去世博主曾造谣成龙去世", "拜登患癌遭质疑：怎么可能刚发现", "北方热热热热热 南方雨雨雨雨雨", "油价下调 加满一箱油将少花9元", "小伙白天上班晚上送外卖攒钱结婚", "贪2.61亿！落马正部韩勇被判死缓", "S妈让汪小菲夫妇卖车拿钱", "贵州茅台：支持工作餐不上酒的规定", "曹骏已经进于正的剧组做妆造了", "精神病父亲转院治疗在病房自杀身亡", "小米汽车回应退订60天冷静期", "陈幸同钱天一2比3惜败德国组合", "上海夫妻花3.8万定制婚书", "金价突发巨震 一度重回3240美元", "王曼昱蒯曼3比0车秀英朴秀景", "有人走私600公斤稀土？南宁海关回应", "陈奕迅社交账号在线", "女子养鸽子4天后宰杀煲汤感染肺炎", "孙颖莎4比0胜朝鲜选手晋级32强", "肖战张婧仪同框出席《藏海传》活动", "沃尔玛CEO抱怨顶不住关税", "中超第13轮综述：申花稳居榜首", "美国失去最后一个3A评级有何影响", "余承东谈鸿蒙折叠电脑", "肖战谈《藏海传》角色矛盾感", "范丞丞方辟谣陪表姐产检", "CBA官方处罚广厦男篮", "司机高速上开斗气车还停车干架", "孙颖莎将军拔剑太帅了", "平野美宇哭了", "自行车比赛多名选手同一弯道摔倒", "大国重器接连传出好消息", "魏牌蓝山焕新款5月20日亮相", "美财长：沃尔玛会“咽下部分关税”", "《藏海传》热度低 肖战下凡救场", "中柬联演双方官兵多课目混编同训", "新款沃尔沃S90将于5月29日上市"]

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
