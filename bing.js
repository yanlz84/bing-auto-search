// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.289
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
var default_search_words = ["推动全球开放合作的中国担当", "海底捞小便事件涉案者父母赔220万", "中方回应以色列72小时内袭击6国", "待我回家 代我回家 带我回家", "成都奔驰女司机接娃堵路十几分钟", "黄雨婷、潘展乐等人记大功", "美国第2架B-21轰炸机首飞", "女子将行李箱从43楼抛下辩称没拿住", "中方：希望墨西哥慎之又慎", "男童在小区电梯门口被毒蛇咬伤", "于东来发文力挺西贝", "河南南阳辟谣“法院警车接亲”", "西贝厨师被记者问懵了", "女老板看上男下属花300万让其离婚", "热热热！全国秋老虎返场地图出炉", "西贝到底冤不冤", "外交部回应福建舰通过台湾海峡", "丹麦采购防空武器 约合人民币649亿", "广西一市委书记任上被查", "西贝厨师长回应羊肉串可隔夜卖2天", "女子遭老板性侵后看到秃顶男就应激", "西贝承认部分菜品存在隔夜情况", "美国发生斩首事件 凶手淡定扔头颅", "《天龙八部》乔峰配音演员黄河去世", "一架波音737客机迫降日本关西机场", "云上贵州董事长徐昊被查", "波兰总理驳斥特朗普", "中方回应巴西前总统博索纳罗被判刑", "台北高等法院撤销柯文哲交保裁定", "蓝佛安回应政府负债问题", "西贝公开信称罗永浩指责不实后秒删", "#预制菜真的有这么不堪吗#", "#当无语哥碰上沪cares#", "他信在狱中或当外语老师", "财政部部长蓝佛安最新发声", "新疆霍拉山初秋草原像开了滤镜", "西贝要求所有员工品尝罗永浩菜单", "中国是世界最安全国家之一", "福建舰首次通过台湾海峡意味什么", "台北一社区水塔内发现男性浮尸", "西贝单日收入减少200万", "白俄罗斯：波兰升级局势 欧盟埋单", "俄称斯摩棱斯克核电站建筑遭袭击", "仲裁法完成修订", "在美被捕韩籍员工乘包机返回韩国", "西贝公布罗永浩点的13道菜制作过程", "司机上车前未观察周围情况撞伤路人", "西贝全国门店上线“罗永浩菜单”", "四川一奔驰坠江沉没 司机翻窗逃生", "#被罗永浩吐槽的西贝算预制菜吗#", "王曼昱逆转晋级澳门赛八强"]

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
