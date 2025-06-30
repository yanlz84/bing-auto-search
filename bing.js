// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.141
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
var default_search_words = ["习近平：共产党就是为人民服务的", "中方回应是否邀请特朗普参加阅兵", "明日公积金账户到账一笔钱 注意查收", "“红色宝藏”里的时光答卷", "陈都灵回应争议：没人逼迫我", "韩国首尔“爱情虫”爆发", "《哪吒2》全球票房破159亿", "男孩被吸入桥洞 大哥死死抓住", "美主播污蔑中国 特朗普：我们也做过", "榕江最大超市损失千万 店长发声", "两轮洪水过境后 榕江现状如何", "睡觉时开风扇比空调更健康？辟谣", "女子新房地下挖出尸骨 警方回应", "10月龄婴儿在展馆内喝奶瓶被赶出", "洪剑涛龙井村喝茶 曝光店员态度恶劣", "深圳卫健委：二手烟是一种霸凌", "#3C标识成充电宝登机标准合理吗#", "圆满完成任务！中国双航母编队返港", "刘国梁女儿在美国夺得高尔夫冠军", "92岁为何还要入党？游本昌回应", "《锦绣芳华》开播", "飞天茅台再度全线下跌", "周深刘雨昕等明星向榕江捐赠物资", "《哪吒2》今日下映 从寒假放到暑假", "92岁游本昌宣誓入党", "“跪行巨人”胡雷：要捐就捐干净", "“京城国企第一贪”被判死缓", "董卿现身眼科诊所就医", "杨瀚森利好 开拓者买断艾顿", "韩红基金会计划捐赠200万驰援贵州", "男子地铁穿病号服拍摄 乘客惊慌躲避", "加拿大取消数字服务税", "《哪吒2》破了这些纪录", "多地宣布对中华田园犬解除禁养", "多地机场提供免费暂存充电宝服务", "中国双航母实战训练遭外军跟踪监视", "84版韦小宝扮演者李小飞去世", "特朗普：加拿大“非常难缠”", "女子回应新房挖出尸骨：腿都吓软了", "养生直播正在“围猎”老人钱包", "聂远声援家乡：夏日再赴贵州村超之约", "陈赫要直播没和邓超鹿晗吃饭", "男子私凿奥特曼石窟将被拆 本人回应", "歼20紧急升空逼退外军战机", "外交部：台湾没有什么“副总统”", "苏北三线城市成了韩国人的快乐老家", "种草太假 年轻人做起了歹物分享", "外交部回应恢复日本水产品进口", "今年来最大范围“桑拿天”来了", "上半年最后一天 A股传两大积极信号", "重庆一区委书记带头下馆子"]

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
