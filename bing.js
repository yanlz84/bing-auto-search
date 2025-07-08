// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.156
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
var default_search_words = ["习近平向抗战烈士敬献花篮", "南京“红老头”系38岁男子 已被刑拘", "特朗普对日韩等14国加税 最高40%", "多措并举应对高温“烤”验", "高铁F座为什么最受欢迎", "外交部：中方已向印度提出交涉", "网警公布6起侮辱英烈案", "山东下了424个大明湖", "曝iPhone17Pro回归全铝机身", "凤凰传奇已连续取消3站演唱会", "游客回应旅行团在意大利被洗劫一空", "横店短剧演员高强度工作去世？假", "中国旅行团在意大利被洗劫 使馆回应", "东亚杯国足0-3不敌韩国", "被普京免职后 俄前交通部长自杀身亡", "美股全线收跌 特斯拉跌超6%", "江苏：县级以下禁止开发政务服务APP", "司法部门回应金毛疑蹭空调被打死", "女星戴燕妮在巴黎被破窗抢劫", "66岁倪萍回应整容传闻：就是老了", "男子拒绝手术 医生自掏3万也要救", "美国得州洪灾已造成至少104人死亡", "21楼玻璃自爆砸坏楼下2辆车", "罗家英患癌放弃化疗 妻子汪明荃回应", "女子挪用公司近1700万买奢侈品", "台风“丹娜丝”或在闽浙二次登陆", "王曼昱3比0卡尔伯格迎开门红", "韩国球员向中国球迷谢场", "矿山瞒报事故举报者信息泄露", "特朗普将对等关税暂缓期延至8月1日", "字节跳动否认甲骨文等将收购TikTok", "航班即将关闭舱门发现2人上错飞机", "特朗普一手加税 一手延长暂缓期", "周启豪0比3阿鲁纳止步男单首轮", "大限逼近 特朗普关税信函即将发出", "特朗普：将对乌克兰输送更多武器", "新任主帅回应国足东亚杯首战失利", "中百万大奖女子与摊主协商达成一致", "曝快船将鲍威尔交易到热火", "也门胡塞武装称在红海击沉一艘货轮", "辛纳晋级温网八强", "朱辰杰两次失误致丢球", "“鲁A的哥”载客打表到拉萨", "沪深交易所将发布专精特新系列指数", "曝蜜雪冰城员工用脚关直饮水桶", "海康威视在加拿大恢复运营", "土耳其一狮子凌晨“越狱”遭射杀", "15岁男孩参加体育考试猝死 山西通报", "Angelababy杨颖造型 一出场便是王炸", "南非总统：将与美谈判 平衡贸易关系", "乌多地遭俄军袭击 至少4人死亡"]

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
