// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.145
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
var default_search_words = ["砥柱中流 风华正茂", "20年前的高考成绩可查", "联合国秘书长：地球越来越危险", "榕江洪灾救援诠释“中国式团结”", "《家有儿女》小雨变成暴雨了", "曝南航一机长杀伤4人后堕楼身亡", "1千多万买公寓入住前夕被水淹", "18岁高中生当CEO 给母校捐了10万", "中国杂技大妈WNBA表演时不慎坠落", "孙女中考744分被奶奶狂亲", "夫妻疑暴雨中触电遇难 知情人发声", "广东中考考前试题泄露？官方通报", "中方回应“2名中国公民在美被捕”", "五台山僧人将米扔出殿外 被劝返回家", "河南西峡抗灾自救后恢复正常生活", "男子偷走烤肠后又顺走两个榴莲", "国乒出征美国大满贯", "知名旅游博主直肠癌去世 年仅38岁", "海关抓LABUBU被网友追成连续剧", "#38岁杨幂营销幼女感有错吗#", "高招会最无人问津的学校竟是它们", "上海交大通报学生疑被校外人员殴打", "受资助贫困生家里装修豪华？学校回应", "南京地铁内喝水不再罚款了", "都是巨物广告 脉动为何遭差评", "卖菜女子成百万网红 父母均智力残疾", "县城手机店正在集体退场", "暴雨黄色预警！京津冀等地大到暴雨", "俄罗斯一女拳击手教猩猩抽电子烟", "00后女子来沪两月消费全靠找茬赖账", "#马斯克为何翻脸也要死磕大而美#", "又到一年一度抓知了猴的季节", "王欣瑜回应陈冠希观战", "万斯一票破局 美参院通过大而美法案", "男子手伤被要求查前列腺 医院回应", "男童打水仗后感染“食脑虫”", "乡村篮球争霸赛 民间篮球高手PK", "字母哥不满雄鹿裁掉利拉德", "10小时60余次地震 日本紧急开记者会", "毕业生晒证书奖状被夸人美还是学霸", "河南濮阳阵风刮倒行道树砸死路人", "胡塞武装：用高超音速导弹袭击以色列", "小沈阳女儿出道专辑只卖了65张", "伊能静夫妇逛街 秦昊肚腩抢镜", "29岁退役军人为救落水者牺牲", "日本7月5日有大地震？官员回应", "特斯拉暂停人形机器人生产", "胡一天曾称自己很便宜求戏拍", "吉林发布山洪灾害气象风险橙色预警", "陈赫回应鹿晗暴瘦", "日本鹿儿岛县附近海域发生5.5级地震"]

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
