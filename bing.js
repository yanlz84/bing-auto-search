// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.74
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
var default_search_words = ["祝全国小朋友们六一儿童节快乐", "南方特大暴雨可能突破“历史极值”", "星舰第9次试飞：火箭喷烈焰笔直升空", "国际化“朋友圈”不断扩展", "老师上课迟到1分钟被认定教学事故", "说广东人烫碗恶心的专家是何来头", "特朗普批普京“在玩火”", "金枕榴莲30天从1200降到730", "男孩捡到66年前装有情书的漂流瓶", "武陵山天池底为304不锈钢？景区回应", "小米总裁：SU7一个能打的对手都没有", "减重专家破解减肥九大谣言", "男子坐共享单车车篮摔死 同伴担全责", "第一批开零食店的人 赚够千万离场了", "中央文件再提“涨工资”是什么信号", "五环唱一宿？岳云鹏回应演唱会质疑", "男子伪造车祸杀妻因太冷静被识破", "端午节3天不调休 高速不免费", "李亚鹏老婆：分居很久 但没有离婚", "女生考法警进体检被曝曾发极端言论", "安徽17年前丢失石狮现身私人博物馆", "谁懂赵丽颖一开口的宿命感", "男子疑明知母亲跌倒不救致其死亡", "航拍山东化工厂爆炸：升起大量浓烟", "王健林“断腕式”自救能走多远", "乌克兰被大轰炸 跟普京遇袭有关吗", "40岁抗癌博主输液时意外离世", "毕业前班主任在教室投屏一年级相册", "好教育不该让学生“拉不出屎”", "导游称雨果下令烧圆明园 园方回应", "特朗普政府暂停留学生新签证面试", "73岁朴槿惠罕见外出笑容灿烂", "浙江男子到河南旅游3个月胖30斤", "投资者：高位买黄金把我害惨了", "张桂梅的小喇叭入藏国家博物馆", "KTV现在只能靠老年人“续命”", "教授回应“广东人烫碗恶心”言论", "德总理连续2天警告以色列：别太过分", "爸爸工亡 胚胎移植子女领抚恤金遭拒", "碗底印“你像猪一样能吃” 门店道歉", "王心凌从彩排开始笑到正式演出", "美使领馆暂停留学生新签证面谈", "网红儿童厨具能轻松切开牛肉", "男童车祸身亡 家属：肇事者是干部", "女子斯诺克世锦赛白雨露两连冠", "高考临近医生咆哮式喊话考生家长", "景区回应月薪3万招帅气NPC：属实", "SpaceX星舰今日进行第九次试飞", "退役仅2年 34岁阿扎尔已胖成球", "媒体评教授炮轰广东人烫碗", "陈艺文夺冠全妹让陈艾森吹口哨庆祝"]

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
