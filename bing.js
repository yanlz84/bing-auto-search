// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.211
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
var default_search_words = ["为党为民、激浊扬清、贵耳重目", "李嘉诚要卖香港老宅？儿子回应", "多地明确最长3天 这假期为何难落地", "7省区市有大暴雨 部分地区特大暴雨", "80岁网红凯凯爷爷去世", "估值超350亿 星巴克中国确认要卖了", "女子去世无子女 百万归亲戚房归国家", "两岁半小狗棍法“出神入化”", "洪水过后大量的遗失物可以捡吗", "巴基斯坦总理发帖感谢中国", "1200亿 哈根达斯要卖了", "成都世运会招兼职需交保证金？假", "哈工程通知书封面是101驱逐舰", "杭州一对夫妻争吵后丈夫跳河身亡", "四川校园霸凌者父母被抓？警方回应", "雷军为小米车主做专属伞 定价169元", "中国在艾滋病疫苗研发领域取得进展", "2万亿元的大生意瞄准年轻人的钱包", "北京洪水又来了", "女子赤脚盘坐上海地铁被指患灰指甲", "骗取公务员身份升至厅级 蔡光辉被捕", "交警回应司机逆行插队被拒放狠话", "学子考上清华 村里请英歌队隆重庆祝", "上班路上被洪水冲走 人社局不算工伤", "许倬云曾含泪说出：但悲不见九州同", "著名历史学家许倬云去世 享年95岁", "游客车钥匙不慎被土拨鼠叼走", "记者暗访调查养生馆骗局", "上海餐厅一份蛋炒饭卖258元引热议", "电影《731》发布血证版海报", "内蒙古一地出现巨型龙卷风", "云南4天官宣4个正厅级落马", "多趟列车停运或折返运行 12306回应", "余承东：尊界S800大定破万台", "教师招聘笔试17分考生进复审", "接受不了生女儿？方力申澄清", "境外买卖股票收入也要缴税", "针孔摄像头仍有售卖 可做成玩偶款式", "反诈宣传那么多 为何还有年轻人上当", "许倬云的幼年中年暮年", "美一船只与鲸鱼相撞 乘客被甩入水中", "许倬云曾说要葬在父母的坟墓旁", "歼-10C凭啥能“击落”隐身机", "许倬云面对剧变的时代曾这样说", "樊振东莫雷加德聚餐", "刘凯男子400米夺冠 打破全国纪录", "#潘展乐丢金是因为商业活动过多吗#", "白鹿遭蹲守偷拍 工作室报警", "关税重锤落下 美国经济会大萧条么", "24岁女生酷似大S走红：没整容", "4岁男孩每天吃3根冰淇淋突然失声"]

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
